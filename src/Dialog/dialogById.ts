import * as parse from 'parse/node';
import { DialogModel } from '../Models/Dialog';
import { KnowledgeLevel, getKnowledgeLevelKey,parseKnowledgeLevel } from '../Common/KnowledgeLevel';
import { SituationPreviewModel } from 'Models/SituationPreview';
import { ImageType } from '../Common/ImageTypes';
import { AudioType } from '../Common/AudioType';

Parse.Cloud.define('dialogById', async (req: any) => {

    const dialogId = req.params.id;
    const knowledgeLevel = parseKnowledgeLevel(req.params.level) ?? KnowledgeLevel.B;
    const knowledgeLevelKey = getKnowledgeLevelKey(knowledgeLevel);

    if (!dialogId) {
        throw new Error('Dialog ID is required');
    }

    let query = new Parse.Query('Dialog');
    let dialog = await query.get(dialogId);
    
    let dialogModel = await DialogModel.fromParse(dialog);
    let speechQuery = dialog.relation(knowledgeLevelKey).query();
    speechQuery.ascending('order');
    speechQuery.include("speaker")
    let speechs = await speechQuery.find();
    let lines = [];

    var initialSpeakerId = null

    for (let speech of speechs) {
        
        let speaker = speech.get("speaker");
        if (initialSpeakerId == null) {
            initialSpeakerId = speaker.id;
        }
        let author = speaker.get("name");
        let avatar = {
            type : ImageType.URL,
            url : speaker.get("image_link")
         }
        let style = speaker.id == initialSpeakerId ? "gray" : "blue";
        let voice = {
            type : AudioType.MP3,
            url : generateAudioPath(speaker)
        }
        lines.push({
            author: author,
            avatar: avatar,
            text: speech.get("text"),
            voice_over: voice,
            style: style
        })
    }
    
    var result = dialogModel.toJSON();
    result.lines = lines;

    return result;
});


function generateAudioPath(speaker: Parse.Object): string {
    return "https://readingstorage.fra1.digitaloceanspaces.com/test/BRyHiBsK05.mp3";

    // const finalPath = `https://readingstorage.fra1.digitaloceanspaces.com/test/${speaker.id}.mp3`;
    // return finalPath;

}