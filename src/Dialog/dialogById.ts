
import semver from 'semver';
import { DialogModel } from '../Models/Dialog';
import { KnowledgeLevel, getKnowledgeLevelKey, parseKnowledgeLevel, getTasksLevelKeyByVersion } from '../Common/KnowledgeLevel';
import { SituationPreviewModel } from 'Models/SituationPreview';
import { ImageType } from '../Common/ImageTypes';
import { AudioType } from '../Common/AudioType';
import { LineType } from '../Common/LineTypes';
import { InteractiveElementModel } from '../Models/InteractiveElement';

Parse.Cloud.define('dialogById', async (req: any) => {

    const version = req.params.version;
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
    let speeches = await speechQuery.find();
    let lines = [];

    var initialSpeakerId = null

    for (let speech of speeches) {
        let speaker = speech.get("speaker");
        if (initialSpeakerId == null) {
            initialSpeakerId = speaker.id;
        }
        let author = speaker.get("name");
        let avatar = {
            type: ImageType.URL,
            data: speaker.get("image_link"),
            background: null
        }
        let style = speaker.id == initialSpeakerId ? "gray" : "blue";
        let voice = {
            type: AudioType.MP3,
            url: generateAudioPath(speech),
            timestamps: generateAudioTimestampsPath(speech)
        }

        const dialogLine = {
            type: LineType.SPEECH,
            id: speech.id,
            author: author,
            order: speech.get("order"),
            avatar: avatar,
            text: speech.get("text"),
            voice_over: voice,
            style: style
        };

        lines.push(dialogLine);
    }

    if (semver.gte(version, '2.0.0')) {

        // Получаем интерактивные элементы диалога
        let taskLevelKey = getTasksLevelKeyByVersion(knowledgeLevel);
        console.log(taskLevelKey);
        let interactiveQuery = dialog.relation(taskLevelKey).query();
        console.log(interactiveQuery);
        interactiveQuery.ascending('order');
        console.log(interactiveQuery);
        let interactiveElements = await interactiveQuery.find();

        console.log(interactiveElements);
        // Преобразуем интерактивные элементы в линии диалога
        for (let element of interactiveElements) {
            const elementModel = await InteractiveElementModel.fromParse(element);
            const elementType = elementModel.type;

            if (elementType === LineType.SELECT_OPTION) {
                const elementLine = elementModel.toJSON();
                lines.push(elementLine);
            }
            // Здесь можно добавить обработку других типов интерактивных элементов
        }

        // Сортируем все линии по порядку
        lines.sort((a, b) => {
            const orderA = a.order + (a.type === LineType.SPEECH ? 1 : 0);
            const orderB = b.order + (b.type === LineType.SPEECH ? 1 : 0);
            return orderA - orderB;
        });
    }
    
    var result = dialogModel.toJSON();
    result.lines = lines;

    return result;
});


function generateAudioPath(speech: Parse.Object): string {
    let url = process.env.DIGITALOCEAN_SPACES_STORAGE_URL;
    let filename = speech.id + ".mp3";
    let finalPath = url + "speeches/" + filename;

    return finalPath;
}

function generateAudioTimestampsPath(speech: Parse.Object): string {
    let url = process.env.DIGITALOCEAN_SPACES_STORAGE_URL;
    let filename = speech.id + "_timestamps" + ".json";
    let finalPath = url + "speeches/" + filename;

    return finalPath;
}