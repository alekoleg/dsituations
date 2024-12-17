const Parse = require('parse/node');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { genearateDialogsBasedOnTitle } = require('./common/situationsAIGenerator');

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log('appId:', appId);

if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId); 
Parse.serverURL = serverURL; 
Parse.masterKey = masterKey;


// Функция для получения конкретной ситуации по ID
async function fetchSituationById(situationId) {
    const Situation = Parse.Object.extend('Situation');
    const query = new Parse.Query(Situation);
    
    try {
        const situation = await query.get(situationId, { useMasterKey: true });
        const title = situation.get('title');
        console.log('Обработка ситуации:', title);
        
        if (title) {
            await genearateDialogsBasedOnTitle(title, situation);
        }
        
        console.log('Ситуация обработана успешно.');
    } catch (error) {
        console.error('Ошибка при получении ситуации:', error);
    }
}

// Получаем ID ситуации из аргументов командной строки
const situationId = process.argv[2];

if (!situationId) {
    console.error('Пожалуйста, укажите ID ситуации в качестве аргумента.');
    console.error('Пример: node fillSituationByIdWithDialog.js YOUR_SITUATION_ID');
    process.exit(1);
}

// Запуск процесса
fetchSituationById(situationId);