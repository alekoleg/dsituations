const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация Parse
Parse.initialize(process.env.APP_ID);
Parse.serverURL = process.env.SERVER_URL;
Parse.masterKey = process.env.MASTER_KEY;

/**
 * Создает или обновляет спикера
 * @param {Object} speakerData - Данные спикера из JSON
 * @returns {Promise<Parse.Object>}
 */
async function createOrUpdateSpeaker(speakerData) {
  const Speaker = Parse.Object.extend('Speaker');
  const query = new Parse.Query(Speaker);
  
  // Ищем существующего спикера по id
  query.equalTo('objectId', speakerData.id);
  let speaker = await query.first({ useMasterKey: true });
  
  if (!speaker) {
    speaker = new Speaker();
  }
  
  speaker.set('name', speakerData.name);
  
  
  if (speakerData.avatar !== null && speakerData.avatar !== undefined && speakerData.avatar.type == 'url') {
    speaker.set('image_link', speakerData.avatar.data);
  }
  
  await speaker.save(null, { useMasterKey: true });
  return speaker;
}

/**
 * Создает или обновляет реплику диалога
 * @param {Object} lineData - Данные реплики
 * @param {Object} speakersMap - Карта соответствия id спикеров и их объектов
 * @param {number} order - Порядковый номер реплики
 * @returns {Promise<Parse.Object>}
 */
async function createSpeech(lineData, speaker, order) {
  const Speech = Parse.Object.extend('Speech');
  const speech = new Speech();
  
  speech.set('text', lineData.text);
  speech.set('order', order);
  speech.set('speaker', speaker);
  
  await speech.save(null, { useMasterKey: true });
  return speech;
}

/**
 * Создает интерактивное задание
 * @param {Object} taskData - Данные задания
 * @param {Parse.Object} dialog - Объект диалога
 * @param {number} order - Порядковый номер задания
 * @param {string} level - Уровень сложности
 * @returns {Promise<Parse.Object>}
 */
async function createInteractiveTask(taskData, dialog, order, level) {
  const InteractiveTask = Parse.Object.extend('InteractiveTask');
  const task = new InteractiveTask();

  let taskOrder = order + 1;
  task.set('type', taskData.type);
  task.set('dialog', dialog);
  task.set('order', taskOrder);
  task.set('level', level);
  const data = {
    question: taskData.question,
    answers: taskData.answers
  }
  task.set('data', JSON.stringify(data));
  
  await task.save(null, { useMasterKey: true });
  return task;
}

/**
 * Создает или обновляет диалог
 * @param {Object} dialogData - JSON данные диалога
 * @returns {Promise<void>}
 */
async function createOrUpdateDialog(dialogData) {
  try {
    console.log('Начинаем обработку диалога:', dialogData.title);
    
    const Dialog = Parse.Object.extend('Dialog');
    const query = new Parse.Query(Dialog);
    
    // Ищем существующий диалог по id
    query.equalTo('objectId', dialogData.id);
    let dialog = await query.first({ useMasterKey: true });
    
    if (!dialog) {
      console.log('Создаем новый диалог');
      dialog = new Dialog();
    } else {
      console.log('Обновляем существующий диалог');
    }
    
    // Обновляем основные поля диалога
    dialog.set('title', dialogData.title);
    dialog.set('subtitle', dialogData.subtitle);
    // find situation by id
    if (dialogData.situation_id) {
      const Situation = Parse.Object.extend('Situation');
      const situationQuery = new Parse.Query(Situation);
      situationQuery.equalTo('objectId', dialogData.situation_id);
      const situation = await situationQuery.first({ useMasterKey: true });
      dialog.set('situation', situation);

      // add to situation dialogs relation
      const relation = situation.relation('dialogs');
      relation.add(dialog);
      await situation.save(null, { useMasterKey: true });
    }
    dialog.set('is_premium', dialogData.isPremium);
    
    if (dialogData.image) {
      if (dialogData.image.type === 'emoji') {
        dialog.set('emoji', dialogData.image.data);
      } else if (dialogData.image.type === 'url') {
        dialog.set('image_link', dialogData.image.data);
      }
    }
    
    await dialog.save(null, { useMasterKey: true });
    
    // Создаем или обновляем спикеров
    console.log('Обрабатываем спикеров...');
    const speakersMap = {};
    for (const speakerData of dialogData.speakers) {
      const speaker = await createOrUpdateSpeaker(speakerData);
      speakersMap[speakerData.id] = speaker;
      speakersMap[speakerData.name] = speaker;
    }
    
    // Очищаем существующие связи для данного уровня
    const levelKey = `dialog_${dialogData.level.toLowerCase()}`;
    const relation = dialog.relation(levelKey);
    const existingSpeeches = await relation.query().find({ useMasterKey: true });
    for (const speech of existingSpeeches) {
       relation.remove(speech);
       await speech.destroy({ useMasterKey: true });
    }

    const taskLevelKey = `tasks_${dialogData.level.toLowerCase()}`;
    const taskRelation = dialog.relation(taskLevelKey);
    const existingTasks = await taskRelation.query().find({ useMasterKey: true });
    for (const task of existingTasks) {
        taskRelation.remove(task);
        await task.destroy({ useMasterKey: true });
    }
    
    // Обрабатываем реплики и интерактивные задания
    console.log('Обрабатываем реплики и задания...');
    let order = 10;
    for (const line of dialogData.lines) {
      if (!line.type || line.type === 'speech') {
        const speaker = speakersMap[line.speaker] ;
        const speech = await createSpeech(line, speaker, order);
        relation.add(speech);
      } else if (line.type === 'selectOption') {
        const task = await createInteractiveTask(line, dialog, order, dialogData.level);
        taskRelation.add(task);
      }
      order += 10;
    }
    
    await dialog.save(null, { useMasterKey: true });
    console.log('Диалог успешно обработан');
    
  } catch (error) {
    console.error('Ошибка при обработке диалога:', error);
    throw error;
  }
}

/**
 * Основная функция для обработки JSON файла
 * @param {string} jsonPath - Путь к JSON файлу
 */
async function processDialogJSON(jsonPath) {
  try {
    const dialogData = require(jsonPath);
    await createOrUpdateDialog(dialogData);
    console.log('Обработка JSON завершена успешно');
  } catch (error) {
    console.error('Ошибка при обработке JSON:', error);
  }
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const jsonPath = args[0];

if (!jsonPath) {
  console.error('Укажите путь к JSON файлу в качестве аргумента');
  process.exit(1);
}

// Запускаем процесс
processDialogJSON(jsonPath)
  .then(() => {
    console.log('Скрипт успешно завершен');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Критическая ошибка при выполнении скрипта:', error);
    process.exit(1);
  });
