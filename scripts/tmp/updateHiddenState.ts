const fs = require('fs');
const readline = require('readline');
const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
// const jsKey = process.env.YOUR_JAVASCRIPT_KEY;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;

console.log('appId:', appId);

if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId); 
Parse.serverURL = serverURL; 
Parse.masterKey = masterKey;

// Функция для поиска родительского объекта (Topic) по objectId
async function updateSituationsHiddenState() {
    const Topic = Parse.Object.extend("Topic"); // Используем Topic как родительский объект
    const query = new Parse.Query(Topic);
    
    try {
        const results = await query.find();
        console.log('Найдено тем:', results.length);
        for (let i = 0; i < results.length; i++) {
            const topicObject = results[i];
            const topicIsHidden = topicObject.get('hidden') ?? false;
            const situtations = await topicObject.relation("situations").query().find();
            console.log('Найдено ситуаций для темы:', situtations.length);
            for (let j = 0; j < situtations.length; j++) {
                console.log('Обработка ситуации:', j + 1, 'из', situtations.length);
                console.log('ID ситуации:', situtations[j].id);
                console.log('Название ситуации:', situtations[j].get('title'));
                let situationObject = situtations[j];
                if (topicIsHidden) {
                    situationObject.set('hidden', true);
                } else {
                    // false if J is even
                    situationObject.set('hidden', j % 2 === 0);
                }
                await situationObject.save();
                console.log('Ситуация успешно обновлена');
            }
            console.log('Все ситуации для темы обработаны');
        }
        console.log('Все темы обработаны');
    } catch (error) {
        console.error('Ошибка при поиске Topic:', error);
    }
}

async function updateDialogsHiddenState() {
    const Situation = Parse.Object.extend("Situation"); // Используем Topic как родительский объект
    const query = new Parse.Query(Situation);
    query.limit(1000);
    
    try {
        const results = await query.find();
        console.log('Найдено тем:', results.length);
        for (let i = 0; i < results.length; i++) {
            const situationObject = results[i];
            const situationIsHidden = situationObject.get('hidden') ?? false;
            const dialogs = await situationObject.relation("dialogs").query().find();
            console.log('Найдено диалогов для ситуации:', dialogs.length);
            for (let j = 0; j < dialogs.length; j++) {
                console.log('Обработка диалога:', j + 1, 'из', dialogs.length);
                let dialogObject = dialogs[j];
                if (situationIsHidden) {
                    dialogObject.set('hidden', true);
                } else {
                    // false if J is even
                    dialogObject.set('hidden', j % 2 === 0);
                }
                await dialogObject.save();
                console.log('Диалог успешно обновлен');
            }
            console.log('Все ситуации для темы обработаны');
        }
        console.log('Все темы обработаны');
    } catch (error) {
        console.error('Ошибка при поиске Topic:', error);
    }
}

updateDialogsHiddenState();
// updateSituationsHiddenState();
