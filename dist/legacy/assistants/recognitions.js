"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecognitionsAI = void 0;
const openai_1 = __importDefault(require("openai"));
const keys_1 = require("../configs/keys");
const assistantIds_1 = require("../configs/assistantIds");
class RecognitionsAI {
    constructor() {
        this.openai = new openai_1.default({ apiKey: keys_1.Keys.OpenAIKey });
        this.assistantId = new assistantIds_1.AssistantsIdConfig.AssistantsId().getRecognitionId();
    }
    // Return variantas of recognized text
    recognizeText(text) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Recognizing text: ${text}`);
            const assistant = yield this.openai.beta.assistants.retrieve(this.assistantId);
            const thread = yield this.openai.beta.threads.create();
            const userMessage = yield this.openai.beta.threads.messages.create(thread.id, { role: "user", content: text });
            const run = yield this.openai.beta.threads.runs.create(thread.id, { assistant_id: assistant.id });
            let runStatus = yield this.openai.beta.threads.runs.retrieve(thread.id, run.id);
            while (runStatus.status === "queued" || runStatus.status === "in_progress") {
                console.log(`Run status: ${runStatus.status}`);
                yield new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                runStatus = yield this.openai.beta.threads.runs.retrieve(thread.id, run.id);
            }
            if (runStatus.status === "completed") {
                const messages = yield this.openai.beta.threads.messages.list(thread.id);
                const threamMessage = messages.data[0];
                console.log(threamMessage);
                var result = "";
                threamMessage.content.forEach((content) => {
                    result += content.text.value;
                });
                console.log(`Result: ${result}`);
                var parsed = JSON.parse(result);
                // wrap into array if map
                if (parsed instanceof Map) {
                    parsed = [parsed];
                }
                return parsed;
                // console.log(`Completion: ${completion}`);
            }
            else {
                console.log(`Run status: ${runStatus.status}`);
                throw new Error(`Run status: ${runStatus.status}`);
            }
        });
    }
}
exports.RecognitionsAI = RecognitionsAI;
