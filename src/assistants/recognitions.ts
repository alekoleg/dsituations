import OpenAI from "openai";
import { Keys } from "../configs/keys";
import { AssistantsIdConfig } from "../configs/assistantIds";

export class RecognitionsAI {
    private openai: OpenAI;
    private assistantId: string;

    constructor() {
        this.openai = new OpenAI({ apiKey: Keys.OpenAIKey});
        this.assistantId = new AssistantsIdConfig.AssistantsId().getRecognitionId();    
    }

    // Return variantas of recognized text
    async recognizeText(text: string): Promise<Array<Map<any,any>>> {
        console.log(`Recognizing text: ${text}`);
        const assistant = await this.openai.beta.assistants.retrieve(this.assistantId);
        const thread = await this.openai.beta.threads.create()
        const userMessage = await this.openai.beta.threads.messages.create(thread.id, {role: "user", content: text});
        const run = await this.openai.beta.threads.runs.create(thread.id, {assistant_id: assistant.id});

        let runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
        while(runStatus.status === "queued" || runStatus.status ===  "in_progress"){
            console.log(`Run status: ${runStatus.status}`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            runStatus = await this.openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        if (runStatus.status === "completed") {
            const messages = await this.openai.beta.threads.messages.list(thread.id);
            const threamMessage = messages.data[0];
            console.log(threamMessage);
            var result: string = ""
            threamMessage.content.forEach((content: any) => {
                result += content.text.value;
            })

            console.log(`Result: ${result}`);
            var parsed = JSON.parse(result);
            // wrap into array if map
            if (parsed instanceof Map) {
                parsed = [parsed];
            }
                
            return parsed;
            
            // console.log(`Completion: ${completion}`);
        } else {
            console.log(`Run status: ${runStatus.status}`);
            throw new Error(`Run status: ${runStatus.status}`);
        }

    }
}
