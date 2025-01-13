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


// Функция для получения Situations
async function fetchSituations() {
    const Situation = Parse.Object.extend('Situation');
    const query = new Parse.Query(Situation);
    query.equalTo('dialogs_count', 0);
    // query.limit(1);

    try {
        const results = await query.find({ useMasterKey: true });

        for (const situation of results) {
            const title = situation.get('title');
            console.log('Обработка ситуации:', title);
            if (title) {
                await genearateDialogsBasedOnTitle(title, situation);
            }
        }

        console.log('Все ситуации обработаны.');
    } catch (error) {
        console.error('Ошибка при получении ситуаций:', error);
    }
}

// Запуск процесса
fetchSituations();