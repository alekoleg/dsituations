const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

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

// Функция для выгрузки диалога
async function exportDialogText(dialogId, knowledgeLevel) {
  try {
    console.log(`Экспорт диалога (ID: ${dialogId}, уровень: ${knowledgeLevel})...`);
    
    // Получаем диалог по ID
    const dialogQuery = new Parse.Query('Dialog');
    const dialog = await dialogQuery.get(dialogId);
    
    if (!dialog) {
      console.error(`Диалог с ID ${dialogId} не найден`);
      return null;
    }
    
    const dialogTitle = dialog.get('title');
    const dialogSubtitle = dialog.get('subtitle') || '';
    
    console.log(`Название диалога: ${dialogTitle}`);
    console.log(`Подзаголовок: ${dialogSubtitle}`);
    
    // Определяем ключ для связи в зависимости от уровня
    const knowledgeLevelKey = getKnowledgeLevelKey(knowledgeLevel);
    // Получаем все реплики диалога для выбранного уровня
    console.log(`Получаем реплики для уровня ${knowledgeLevelKey}...`);
    const speechQuery = dialog.relation(knowledgeLevelKey).query();
    console.log('Добавляем speaker в запрос...');
    speechQuery.include("speaker");
    console.log('Устанавливаем сортировку по возрастанию...');
    speechQuery.ascending('order'); // Сортировка по порядку
    console.log('Выполняем запрос к базе данных...');
    const speeches = await speechQuery.find();
    console.log(`Найдено ${speeches} реплик`);
    
    if (speeches.length === 0) {
      console.log(`Для диалога с ID ${dialogId} на уровне ${knowledgeLevel} не найдено реплик`);
      return null;
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
    
    return resultText;
  } catch (error) {
    console.error('Ошибка при экспорте диалога:', error);
    return null;
  }
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const dialogId = args[0];
const level = args[1] || 'b1'; // По умолчанию B1

if (!dialogId) {
  console.error('Укажите ID диалога в качестве аргумента');
  process.exit(1);
}

// Запускаем экспорт
exportDialogText(dialogId, level)
  .then((text) => {
    if (text) {
      console.log('\nТекст диалога:');
      console.log('----------------------------');
      console.log(text);
      console.log('----------------------------');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  });
