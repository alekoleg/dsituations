const Parse = require('parse/node');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация Parse
Parse.initialize(process.env.APP_ID);
Parse.serverURL = process.env.SERVER_URL;
Parse.masterKey = process.env.MASTER_KEY;

/**
 * Получает информацию о спикере в формате JSON
 * @param {Parse.Object} speaker - Объект спикера
 * @returns {Object} - Данные спикера в формате JSON
 */
async function getSpeakerData(speaker) {
  const speakerData = {
    id: speaker.id,
    name: speaker.get('name')
  };

  // Добавляем аватар, если есть
  if (speaker.get('image_link')) {
    speakerData.avatar = {
      type: 'url',
      data: speaker.get('image_link')
    };
  }

  return speakerData;
}

/**
 * Преобразует данные интерактивного задания в формат JSON
 * @param {Parse.Object} task - Интерактивное задание
 * @returns {Object} - Данные задания в формате JSON
 */
function parseInteractiveTask(task) {
  const taskData = task.get('data');
  let parsedData;

  // Проверяем, является ли данные строкой (JSON) или объектом
  if (typeof taskData === 'string') {
    try {
      parsedData = JSON.parse(taskData);
    } catch (e) {
      console.error('Ошибка парсинга данных задания:', e);
      return null;
    }
  } else {
    parsedData = taskData;
  }

  if (task.get('type') === 'selectOption') {
    const result = {
      type: 'selectOption',
      question: parsedData.question,
      answers: []
    };

    // Преобразуем ответы в нужный формат
    if (parsedData.answers && Array.isArray(parsedData.answers)) {
      result.answers = parsedData.answers.map(answer => ({
        text: answer.text,
        isCorrect: answer.is_correct
      }));
    }

    return result;
  }

  return null;
}

/**
 * Скачивает диалог и сохраняет в формате JSON
 * @param {string} dialogId - ID диалога
 * @param {string} level - Уровень сложности (a1, b1, c1)
 * @param {string} outputPath - Путь для сохранения JSON файла
 * @returns {Promise<void>}
 */
async function downloadDialogAsJSON(dialogId, level, outputPath) {
  try {
    console.log(`Начинаем загрузку диалога с ID: ${dialogId}, уровень: ${level}`);
    
    const Dialog = Parse.Object.extend('Dialog');
    const query = new Parse.Query(Dialog);
    
    // Загружаем диалог по ID
    const dialog = await query.get(dialogId, { useMasterKey: true });
    
    if (!dialog) {
      console.error(`Диалог с ID ${dialogId} не найден`);
      return;
    }
    
    // Получаем ситуацию, если она есть
    let situationId = null;
    const situation = dialog.get('situation');
    if (situation) {
      situationId = situation.id;
    }
    
    // Формируем базовую структуру JSON
    const dialogData = {
      id: dialog.id,
      title: dialog.get('title'),
      subtitle: dialog.get('subtitle') || '',
      situation_id: situationId,
      level: level.toLowerCase(),
      isPremium: dialog.get('is_premium') || false,
      speakers: [],
      lines: []
    };
    
    // Добавляем изображение, если оно есть
    if (dialog.get('emoji')) {
      dialogData.image = {
        type: 'emoji',
        data: dialog.get('emoji')
      };
    } else if (dialog.get('image_link')) {
      dialogData.image = {
        type: 'url',
        data: dialog.get('image_link')
      };
    }
    
    // Загружаем реплики
    const levelKey = `dialog_${level.toLowerCase()}`;
    const speechesQuery = dialog.relation(levelKey).query();
    speechesQuery.include('speaker');
    speechesQuery.ascending('order');
    const speeches = await speechesQuery.find({ useMasterKey: true });
    
    // Создаем карту спикеров
    const speakersMap = new Map();
    
    // Обрабатываем реплики и собираем спикеров
    for (const speech of speeches) {
      const speaker = speech.get('speaker');
      if (speaker && !speakersMap.has(speaker.id)) {
        const speakerData = await getSpeakerData(speaker);
        speakersMap.set(speaker.id, speakerData);
      }
      
      dialogData.lines.push({
        order: speech.get('order'),
        speaker: speaker.id,
        text: speech.get('text')
      });
    }
    
    // Добавляем спикеров в результат
    dialogData.speakers = Array.from(speakersMap.values());
    
    // Загружаем интерактивные задания
    const taskLevelKey = `tasks_${level.toLowerCase()}`;
    const tasksQuery = dialog.relation(taskLevelKey).query();
    tasksQuery.ascending('order');
    const tasks = await tasksQuery.find({ useMasterKey: true });
    
    // Добавляем задания в список строк
    for (const task of tasks) {
      const taskData = parseInteractiveTask(task);
      taskData.order = task.get('order');
      if (taskData) {
        dialogData.lines.push(taskData);
      }
    }
    // Сортируем строки по порядку
    dialogData.lines.sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });

    // Записываем результат в файл
    const outputFilePath = outputPath || `./dialog_${dialogId}_${level}.json`;
    fs.writeFileSync(outputFilePath, JSON.stringify(dialogData, null, 2));
    
    console.log(`Диалог успешно скачан и сохранен в файл: ${outputFilePath}`);
    return dialogData;
  } catch (error) {
    console.error('Ошибка при скачивании диалога:', error);
    throw error;
  }
}

/**
 * Основная функция для обработки запроса
 * @param {string} dialogId - ID диалога
 * @param {string} level - Уровень сложности
 * @param {string} outputPath - Путь для сохранения JSON файла
 */
async function processDownloadRequest(dialogId, level, outputPath) {
  try {
    await downloadDialogAsJSON(dialogId, level, outputPath);
    console.log('Скачивание завершено успешно');
  } catch (error) {
    console.error('Ошибка при скачивании диалога:', error);
  }
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const dialogId = args[0];
const level = args[1] || 'b1'; // По умолчанию используем уровень B1
const outputPath = args[2];

if (!dialogId) {
  console.error('Укажите ID диалога в качестве аргумента');
  process.exit(1);
}

// Запускаем процесс
processDownloadRequest(dialogId, level, outputPath)
  .then(() => {
    console.log('Скрипт успешно завершен');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Критическая ошибка при выполнении скрипта:', error);
    process.exit(1);
  });
