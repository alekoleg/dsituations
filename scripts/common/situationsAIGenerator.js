const Parse = require('parse/node');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const openAI_Situations_Assistant_ID = "asst_42rI6HEmcMcsX1qteXVsMEil";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({apiKey: openaiApiKey});

async function genearateDialogsBasedOnTitle(title, situation) {
    try {
        const thread = await openai.beta.threads.create();
        const threadId = thread.id;

        console.log("Thread ID:", threadId);
        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
              role: "user",
              content: title
            });
            
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
            let dialogs = response["dialogs"];
            let relation = situation.relation("dialogs");

            for (const dialog of dialogs) {
                console.log("dialog:", dialog);
                const Dialog = Parse.Object.extend("Dialog"); 
                const dialogObject = new Dialog();
                dialogObject.set("title", dialog.title);
                dialogObject.set("subtitle", dialog.subtitle);
                dialogObject.set("situation", situation);
                await dialogObject.save();
                relation.add(dialogObject);
            }

            await situation.save();
        } else {
            console.log(run.status);
        }
    } catch (error) {
        console.error("Error in conversation:", error.response ? error.response.data : error.message);
    }
}

module.exports = {
    genearateDialogsBasedOnTitle
}; 