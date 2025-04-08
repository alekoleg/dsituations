
const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;


if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId); 
Parse.serverURL = serverURL; 
Parse.masterKey = masterKey;

// Функция для получения Situations
async function fetchDialogs() {
    const Dialog = Parse.Object.extend('Dialog');
    const query = new Parse.Query(Dialog);
    query.limit(1000);  // Установка лимита в 5000
    query.equalTo("is_premium", true);

    try {
        const results = await query.find({ useMasterKey: true });

        for (const dialog of results) {
        //    dialog.set("is_premium", Math.random() < 0.5);
            dialog.set("is_premium", false);
           await dialog.save();
        }

        console.log('Все диалоги обработаны.');
    } catch (error) {
        console.error('Ошибка при получении диалогов:', error);
    }
}


fetchDialogs();