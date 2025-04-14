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
async function deleteHiddenCascade() {
    const Situation = Parse.Object.extend("Situation");
    const query = new Parse.Query(Situation);
    query.equalTo("hidden", true);
    query.limit(1000);
    
    try {
        // Получаем все скрытые ситуации
        const hiddenSituations = await query.find();
        console.log('Найдено скрытых ситуаций:', hiddenSituations.length);
        
        // Обрабатываем каждую ситуацию
        for (const situation of hiddenSituations) {
            console.log(`\nОбработка ситуации ${situation.id}`);
            
            // Получаем диалоги для текущей ситуации
            const dialogs = await situation.relation("dialogs").query().find();
            console.log(`Найдено диалогов: ${dialogs.length}`);
            
            // Обрабатываем каждый диалог
            for (const dialog of dialogs) {
                console.log(`\nОбработка диалога ${dialog.id}`);
                
                // Получаем все реплики для текущего диалога
                const speechesA1 = await dialog.relation("dialog_a1").query().find();
                const speechesB1 = await dialog.relation("dialog_b1").query().find();
                const speechesC1 = await dialog.relation("dialog_c1").query().find();
                
                console.log(`Найдено реплик:`);
                console.log(`- A1: ${speechesA1.length}`);
                console.log(`- B1: ${speechesB1.length}`);
                console.log(`- C1: ${speechesC1.length}`);
                
                // Удаляем все реплики текущего диалога
                for (const speech of [...speechesA1, ...speechesB1, ...speechesC1]) {
                    await speech.destroy();
                }
                console.log('Реплики диалога удалены');
                
                // Удаляем сам диалог
                await dialog.destroy();
                console.log('Диалог удален');
            }
            
            // После удаления всех диалогов удаляем ситуацию
            await situation.destroy();
            console.log(`Ситуация ${situation.id} удалена\n`);
        }
        
        console.log('Все скрытые ситуации обработаны и удалены');

    } catch (error) {
        console.error('Ошибка при каскадном удалении:', error);
    }
}

// Запускаем функцию каскадного удаления
deleteHiddenCascade();