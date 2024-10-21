// const axios = require('axios');
const Parse = require('parse/node');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openAI_Situations_Assistant_ID = "asst_42rI6HEmcMcsX1qteXVsMEil"
console.log('appId:', appId);

if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId); 
Parse.serverURL = serverURL; 
Parse.masterKey = masterKey;

const openai = new OpenAI({apiKey: openaiApiKey});

// Функция для получения Situations
async function fetchSituations() {
    const Situation = Parse.Object.extend('Situation');
    const query = new Parse.Query(Situation);
    query.limit(1);  // Установка лимита в 5000

    try {
        const results = await query.find({ useMasterKey: true });

        for (const situation of results) {
            const title = situation.get('title');
            console.log('Обработка ситуации:', title);
            if (title) {
                await sendTitleToOpenAI(title, situation);
            }
        }

        console.log('Все ситуации обработаны.');
    } catch (error) {
        console.error('Ошибка при получении ситуаций:', error);
    }
}

// Функция для отправки Title в OpenAI Assistant
async function sendTitleToOpenAI(title, situation) {
    try {
        // Создаем новый поток для разговора
        const thread = await openai.beta.threads.create();
        const threadId = thread.id;

        console.log("Thread ID:", threadId);
        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
              role: "user",
              content: title
            })
        let run = await openai.beta.threads.runs.createAndPoll(
            thread.id,
            { 
                assistant_id: openAI_Situations_Assistant_ID,
            });
        
        if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(
            run.thread_id
        );

        let message = messages.data[0];
        let response = JSON.parse(message.content[0].text.value);
        let themes = response.themes
        
        const relation = situation.relation("dialogs");
        for (const theme of themes) {
            console.log("Theme:", theme);
            const Dialog = Parse.Object.extend("Dialog"); 
            const dialog = new Dialog();
            dialog.set("title", theme);
            dialog.set("premium", false);
            await dialog.save();

            relation.add(dialog);
        }

        await situation.save();

        console.log("Last message: Messages:", message.content[0].text.value);

        


        // for (const message of messages.data.reverse()) {
        //     console.log(`${message.role} > ${message.content[0].text.value}`);
        // }
        } else {
            console.log(run.status);
        }
      } catch (error) {
        console.error("Error in conversation:", error.response ? error.response.data : error.message);
      }

}

// Запуск процесса
fetchSituations();