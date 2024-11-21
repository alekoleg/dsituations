const fs = require('fs');
const readline = require('readline');
const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

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
async function findParentObject(objectId) {
    const Topic = Parse.Object.extend("Topic"); // Используем Topic как родительский объект
    const query = new Parse.Query(Topic);
    
    try {
        const parentObject = await query.get(objectId);
        console.log(`Родительский объект Topic с objectId ${objectId} найден.`);
        return parentObject;
    } catch (error) {
        console.error('Ошибка при поиске родительского объекта (Topic):', error);
        process.exit(1);
    }
}

// Функция для сохранения строки как объекта Situation и добавления связи с Topic
async function saveSituationWithRelation(title, parentObject) {
    const Situation = Parse.Object.extend("Situation"); // Используем Situation для сохранения строки
    const situationObject = new Situation();

    situationObject.set('title', title);

    try {
        const savedObject = await situationObject.save();
        console.log(`Situation с title "${title}" сохранен.`);

        // Добавляем связь через relation
        const relation = parentObject.relation("situations"); // Замените "situations" на имя вашего поля relation в Topic
        relation.add(savedObject);
        await parentObject.save();
        console.log(`Situation "${title}" связан с Topic.`);
    } catch (error) {
        console.error('Ошибка при сохранении Situation и добавлении relation:', error);
    }
}

// Чтение файла построчно и сохранение каждой строки с добавлением relation к Topic
function processFile(filePath, parentObject) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        saveSituationWithRelation(line, parentObject); // Сохранение строки как Situation и связь с Topic
    });

    rl.on('close', () => {
        console.log('Файл обработан.');
    });
}

// Получение файла и objectId из аргументов командной строки
const filePath = process.argv[2];
const objectId = process.argv[3]; // objectId родительского объекта (Topic)

if (!filePath || !objectId) {
    console.error('Укажите путь к файлу и objectId родительского объекта (Topic).');
    process.exit(1);
}

// Сначала находим родительский объект Topic, затем обрабатываем файл
findParentObject(objectId)
    .then(parentObject => {
        processFile(filePath, parentObject);
    })
    .catch(error => {
        console.error('Ошибка:', error);
        process.exit(1);
    });
