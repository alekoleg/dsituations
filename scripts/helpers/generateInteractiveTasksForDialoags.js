const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { generateInteractiveSelectOption } = require('../common/interactiveTaskSelectOption');

// Инициализация Parse
Parse.initialize(
  process.env.APP_ID,
);
Parse.serverURL = process.env.SERVER_URL;
Parse.masterKey = process.env.MASTER_KEY;

// Функция для преобразования уровня в ключ relation в базе данных
function getKnowledgeLevelKey(level) {
  switch (level.toLowerCase()) {
    case 'a1':
    case 'a':
      return 'dialog_a1';
    case 'b1': 
    case 'b':
      return 'dialog_b1';
    case 'c1':
    case 'c':
      return 'dialog_c1';
    default:
      return 'dialog_b1'; // По умолчанию используем B1
  }
}

function getInteractiveTaskKey(level) {
    switch (level.toLowerCase()) {
        case 'a1':
        case 'a':
            return 'tasks_a1';
        case 'b1':
        case 'b':
            return 'tasks_b1';
        case 'c1':
        case 'c':
            return 'tasks_c1';
        default:
            return 'tasks_b1';
    }
}

/**
 * Получает текст диалога по ID
 * @param {string} dialogId - ID диалога
 * @param {string} knowledgeLevel - Уровень знаний (a, b, c)
 * @returns {Promise<{text: string, dialog: Parse.Object}>} - Текст диалога и объект диалога
 */
async function getDialogText(dialogId, knowledgeLevel) {
  try {
    console.log(`Экспорт диалога (ID: ${dialogId}, уровень: ${knowledgeLevel})...`);
    
    // Получаем диалог по ID
    const dialogQuery = new Parse.Query('Dialog');
    const dialog = await dialogQuery.get(dialogId);
    
    if (!dialog) {
      console.error(`Диалог с ID ${dialogId} не найден`);
      return { text: null, dialog: null };
    }
    
    const dialogTitle = dialog.get('title');
    const dialogSubtitle = dialog.get('subtitle') || '';
    
    console.log(`Название диалога: ${dialogTitle}`);
    console.log(`Подзаголовок: ${dialogSubtitle}`);
    
    // Определяем ключ для связи в зависимости от уровня
    const knowledgeLevelKey = getKnowledgeLevelKey(knowledgeLevel);
    
    console.log(`Получаем реплики для уровня ${knowledgeLevelKey}...`);
    const speechQuery = dialog.relation(knowledgeLevelKey).query();
    console.log('Добавляем speaker в запрос...');
    speechQuery.include("speaker");
    console.log('Устанавливаем сортировку по возрастанию...');
    speechQuery.ascending('order'); // Сортировка по порядку
    console.log('Выполняем запрос к базе данных...');
    const speeches = await speechQuery.find();
    console.log(`Найдено ${speeches.length} реплик`);
    
    if (speeches.length === 0) {
      console.log(`Для диалога с ID ${dialogId} на уровне ${knowledgeLevel} не найдено реплик`);
      return { text: null, dialog: null };
    }
    
    console.log('Реплики успешно получены');
    let resultText = `# ${dialogTitle}\n`;
    if (dialogSubtitle) {
      resultText += `## ${dialogSubtitle}\n`;
    }
    resultText += `\n`;
    
    // Формируем текст диалога
    for (const speech of speeches) {
      const speaker = speech.get("speaker");
      const speakerName = speaker ? speaker.get("name") : "Unknown";
      const text = speech.get("text");
      
      resultText += `${speakerName}: ${text}\n`;
    }
    
    return { text: resultText, dialog };
  } catch (error) {
    console.error('Ошибка при экспорте диалога:', error);
    return { text: null, dialog: null };
  }
}

/**
 * Создает интерактивные задания и привязывает их к диалогу
 * @param {Parse.Object} dialog - Объект диалога
 * @param {Array} taskDataArray - Массив данных заданий
 * @param {string} level - Уровень знаний (a, b, c)
 * @returns {Promise<Array<Parse.Object>>} - Массив созданных интерактивных заданий
 */
async function createInteractiveTasks(dialog, taskDataArray, dialogLevel, knowledgeLevel) {
  try {
    console.log('Создание интерактивных заданий...');
    const interactiveTaskLevelKey = getInteractiveTaskKey(knowledgeLevel);
    const relation = dialog.relation(interactiveTaskLevelKey);
    
    for (let i = 0; i < taskDataArray.length; i++) {
      const taskData = taskDataArray[i];
      console.log(`Создание задания ${i+1} из ${taskDataArray.length}...`);
      
      // Создаем новый объект InteractiveTask
      const InteractiveTask = Parse.Object.extend('InteractiveTask');
      const interactiveTask = new InteractiveTask();
      
      // Устанавливаем свойства
      interactiveTask.set('type', 'selectOption');
      interactiveTask.set('dialog', dialog);
      interactiveTask.set('order', taskData.order); // Если order не указан, используем индекс
      interactiveTask.set('level', dialogLevel);
      // shuffle answers
      let data = taskData.data;
      data.answers = data.answers.sort(() => Math.random() - 0.5);
      const dataString = JSON.stringify(data);
      interactiveTask.set('data', dataString); // Если структура без уровня data, используем сам объект
      
      // Сохраняем объект
      await interactiveTask.save(null, { useMasterKey: true });
      
      console.log(`Интерактивное задание создано с ID: ${interactiveTask.id}`);
      relation.add(interactiveTask);
    }
    await dialog.save(null, { useMasterKey: true });

  } catch (error) {
    console.error('Ошибка при создании интерактивных заданий:', error);
    throw error;
  }
}

/**
 * Валидирует данные задания
 * @param {Array} taskDataArray - Массив данных заданий
 * @returns {boolean} - Результат валидации
 */
function validateTaskData(taskDataArray) {
  try {
    if (!Array.isArray(taskDataArray)) {
      console.error('Некорректный формат данных: taskDataArray не является массивом');
      return false;
    }
    
    for (const taskData of taskDataArray) {
      // Проверяем структуру данных (может быть с уровнем data или без)
      const data = taskData.data || taskData;
      
      // Проверяем вопрос
      if (!data.question || typeof data.question !== 'string') {
        console.error('Некорректный формат данных: отсутствует вопрос или он не строка');
        return false;
      }
      
      // Проверяем ответы
      if (!data.answers || !Array.isArray(data.answers) || data.answers.length < 2) {
        console.error('Некорректный формат данных: отсутствуют варианты ответов или их меньше 2');
        return false;
      }
      
      // Проверяем, что есть хотя бы один правильный ответ
      const correctAnswers = data.answers.filter(answer => answer.is_correct === true);
      if (correctAnswers.length !== 1) {
        console.error(`Некорректный формат данных: должен быть ровно один правильный ответ, найдено ${correctAnswers.length}`);
        return false;
      }
      
      // Проверяем формат каждого ответа
      for (const answer of data.answers) {
        if (!answer.id || !answer.text || typeof answer.is_correct !== 'boolean') {
          console.error('Некорректный формат данных: неправильный формат ответа');
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при валидации данных задания:', error);
    return false;
  }
}

/**
 * Основная функция для генерации интерактивных заданий для диалога
 * @param {string} dialogId - ID диалога
 * @param {string} level - Уровень знаний (a, b, c)
 * @returns {Promise<void>}
 */
async function generateTasksForDialog(dialogId, level = 'b') {
  try {
    console.log(`Начинаем генерацию заданий для диалога ${dialogId}...`);
    
    // 1. Получаем текст диалога
    const { text, dialog } = await getDialogText(dialogId, level);
    
    if (!text || !dialog) {
      console.error('Не удалось получить текст диалога');
      return;
    }
    
    console.log('Текст диалога успешно получен');
    
    // 2. Генерируем интерактивное задание
    console.log('Отправляем текст на генерацию интерактивного задания...');
    const generatedTasks = await generateInteractiveSelectOption(text);

    console.log('Интерактивное задание успешно сгенерировано');
    console.log(generatedTasks);

    if (!generatedTasks || generatedTasks.length === 0) {
      console.error('Не удалось сгенерировать интерактивные задания');
      return;
    }
    
    console.log(`Успешно сгенерировано ${generatedTasks.length} интерактивных заданий`);
    
    // 3. Валидируем данные задания
    if (!validateTaskData(generatedTasks)) {
      console.error('Сгенерированные задания не прошли валидацию');
      return;
    }
    
    console.log('Задания успешно прошли валидацию');
    
    // 4. Создаем интерактивные задания и привязываем к диалогу
    await createInteractiveTasks(dialog, generatedTasks, level, level);
    
    
    console.log('Процесс успешно завершен');
  } catch (error) {
    console.error('Ошибка при генерации заданий для диалога:', error);
  }
}



async function generateTasksForDialogs() {
    const dialogsQuery = new Parse.Query('Dialog');
    dialogsQuery.equalTo('hidden', false);
    dialogsQuery.limit(1000);
    dialogsQuery.skip(0);
    const dialogs = await dialogsQuery.find();
    
    for (const dialog of dialogs) {
        const tastkQuery = dialog.relation('tasks_b1').query();
        const tasks = await tastkQuery.find();
        if (tasks.length > 0) {
            console.log(`Диалог ${dialog.id} уже имеет задания`);
            continue;
        } else {
            console.log(`Диалог ${dialog.id} не имеет заданий`);
            try {
                await generateTasksForDialog(dialog.id, 'b');
            } catch (error) {
                console.error(`Ошибка при генерации заданий для диалога ${dialog.id}: ${error}`);
            }
        }
    }
}

generateTasksForDialogs();

// // Обработка аргументов командной строки
// const args = process.argv.slice(2);
// const dialogId = args[0];
// const level = args[1] || 'b'; // По умолчанию B1

// if (!dialogId) {
//   console.error('Укажите ID диалога в качестве аргумента');
//   process.exit(1);
// }

// // Запускаем процесс
// generateTasksForDialog(dialogId, level)
//   .then((tasks) => {
//     if (tasks) {
//       console.log(`Создано ${tasks.length} интерактивных заданий`);
//     }
//     console.log('Скрипт успешно завершен');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('Критическая ошибка при выполнении скрипта:', error);
//     process.exit(1);
//   });
