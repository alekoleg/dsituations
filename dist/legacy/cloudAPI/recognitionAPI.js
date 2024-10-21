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
Object.defineProperty(exports, "__esModule", { value: true });
const recognitions_1 = require("../assistants/recognitions");
const db_1 = require("../assistants/db");
const keys_1 = require("../configs/keys");
Parse.Cloud.define('recognizeText', (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    req.log.info(req);
    var input = (_a = req.params.text) !== null && _a !== void 0 ? _a : "ema";
    if (input.length <= 2) {
        return {};
    }
    const recognition = new recognitions_1.RecognitionsAI();
    const clearedInput = input.replace(/[^a-zA-Z ]/g, "");
    const inputArray = clearedInput.split(" ");
    var needToRecognize = [];
    var recognized = [];
    for (let word of inputArray) {
        const object = yield db_1.DB.getWord(word);
        if (object == null) {
            needToRecognize.push(word);
        }
        else {
            recognized.push(object);
        }
    }
    if (needToRecognize.length > 0) {
        const wordsForRecognition = needToRecognize.join(" ");
        console.log(`Recognizing words: ${wordsForRecognition}`);
        const recognitionResult = yield recognition.recognizeText(wordsForRecognition);
        for (let word of recognitionResult) {
            const saved = yield db_1.DB.storeWrods([word]);
            recognized = recognized.concat(saved);
        }
    }
    var result = "";
    recognized.map((object) => {
        result += object.get(keys_1.APIKeys.InfinitiveKey) + " ";
        result += object.get(keys_1.APIKeys.VariantsKey).join(", ") + " ";
        result += '\n';
    });
    return result;
}));
