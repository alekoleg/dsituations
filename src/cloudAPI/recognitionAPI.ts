import { RecognitionsAI } from '../assistants/recognitions';
import * as parse from 'parse/node';
import { DB } from '../db';
import {APIKeys } from '../configs/keys';




Parse.Cloud.define('recognizeText', async (req: any) => {
    req.log.info(req);


    var input = req.params.text ?? "ema";

    if (input.length <= 2) {
        return {}
    }

    const recognition = new RecognitionsAI();
    const clearedInput: string = input.replace(/[^a-zA-Z ]/g, "");
    const inputArray =  clearedInput.split(" ");

    var needToRecognize: Array<string> = [];
    var recognized: Array<Parse.Object> = [];

    for (let word of inputArray) { 
        const object = await DB.getWord(word);
        if (object == null) {
            needToRecognize.push(word);
        } else {
            recognized.push(object);
        }
    }

    
    if (needToRecognize.length > 0) {
        const wordsForRecognition = needToRecognize.join(" ");
        console.log(`Recognizing words: ${wordsForRecognition}`);
        const recognitionResult = await recognition.recognizeText(wordsForRecognition);
        for (let word of recognitionResult) {
            const saved = await DB.storeWrods([word]);
            recognized = recognized.concat(saved);
        }
    }

    var result = "";
    recognized.map((object) => { 
        result += object.get(APIKeys.InfinitiveKey) + " ";
        result += object.get(APIKeys.VariantsKey).join(", ") + " ";
        result += '\n';
     });

    
    return result;
  });