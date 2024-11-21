
const Parse = require('parse/node');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const openAI_Situations_Assistant_ID = "asst_NXTKrg5yTLsyE38busubncqP"
const parseSpeaker1Id = "2B2zENPfFH"
const parseSpeaker2Id = "QNnMXmx2gr"

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
async function fetchDialogs() {
    const Dialog = Parse.Object.extend('Dialog');
    const query = new Parse.Query(Dialog);
    query.limit(1);  // Установка лимита в 5000

    // поиск спикеров
    const Speaker = Parse.Object.extend("Speaker");
    const querySpeaker = new Parse.Query(Speaker);
    const speaker1 = await querySpeaker.get(parseSpeaker1Id);
    const speaker2 = await querySpeaker.get(parseSpeaker2Id);

    try {
        const results = await query.find({ useMasterKey: true });

        for (const dialog of results) {
            const title = dialog.get('title');
            const subtitle = dialog.get('subtitle');
            if (title) {
                await sendTitleToOpenAI(title, subtitle, "a1", "dialog_a1", dialog, speaker1, speaker2);
                await sendTitleToOpenAI(title, subtitle, "b1", "dialog_b1", dialog, speaker1, speaker2);
                await sendTitleToOpenAI(title, subtitle, "c1", "dialog_c1", dialog, speaker1, speaker2);
            }
        }

        console.log('Все ситуации обработаны.');
    } catch (error) {
        console.error('Ошибка при получении ситуаций:', error);
    }
}

// Функция для отправки Title в OpenAI Assistant
async function sendTitleToOpenAI(title, subtitle, level, reletionKey, mainDialogObject, speaker1, speaker2) {
    try {
        // Создаем новый поток для разговора
        const thread = await openai.beta.threads.create();
        const threadId = thread.id;
        const promtMessage = level + "/" + title + "(" + subtitle + ")";

        console.log('Promt:', promtMessage);
        console.log("Thread ID:", threadId);
        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
              role: "user",
              content: promtMessage
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

        console.log("Message:", message.content[0].text.value); 
        let response = JSON.parse(message.content[0].text.value);
        let dialog = response["dialog"];

        
        const speechReletion = mainDialogObject.relation(reletionKey);
        // for with index
        for (var i = 0; i < dialog.length; i++) {
            
            const speechFromDialog = dialog[i];
            const Speech = Parse.Object.extend("Speech"); 
            const parseObject = new Speech();
            
            

            parseObject.set("text", speechFromDialog.text);
            parseObject.set("order", i);
            if (speechFromDialog.speaker === "speaker1") {
                parseObject.set("speaker", speaker1);
            } else {
                parseObject.set("speaker", speaker2);
            }
            await parseObject.save();

            speechReletion.add(parseObject);
        }

        await mainDialogObject.save();
        
        } else {
            console.log(run.status);
        }
      } catch (error) {
        console.error("Error in conversation:", error.response ? error.response.data : error.message);
      }

}

// Запуск процесса
fetchDialogs();