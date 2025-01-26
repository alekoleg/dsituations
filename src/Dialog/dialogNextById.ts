import * as parse from 'parse/node';
import { DialogModel } from '../Models/Dialog';
import { KnowledgeLevel, parseKnowledgeLevel } from '../Common/KnowledgeLevel';
import { ImageType } from '../Common/ImageTypes';
import { SectionType } from '../Common/SectionTypes';
Parse.Cloud.define('dialogNextById', async (req: any) => {
    const dialogId = req.params.id;
    const knowledgeLevel = parseKnowledgeLevel(req.params.level) ?? KnowledgeLevel.B;
    console.log(`[dialogNextById] Starting with dialogId: ${dialogId}, knowledgeLevel: ${knowledgeLevel}`);

    if (!dialogId) {
        console.log('[dialogNextById] Dialog ID is missing');
        throw new Error('Dialog ID is required');
    }

    // Получаем текущий диалог
    let dialogQuery = new Parse.Query('Dialog');
    let currentDialog = await dialogQuery.get(dialogId);
    console.log(`[dialogNextById] Found current dialog: ${currentDialog.id}`);
    
    // Получаем связанную ситуацию
    let situation = await currentDialog.get('situation').fetch();
    console.log(`[dialogNextById] Found related situation: ${situation.id}`);
    
    // Получаем все диалоги ситуации
    let dialogsRelation = situation.relation('dialogs');
    let dialogsQuery = dialogsRelation.query();
    dialogsQuery.ascending('createdAt');
    dialogsQuery.notEqualTo('hidden', true);
    
    // Получаем все диалоги
    const allDialogs = await dialogsQuery.find();
    console.log(`[dialogNextById] Found ${allDialogs.length} total dialogs in situation`);
    
    // Ищем индекс текущего диалога
    const currentIndex = allDialogs.findIndex((dialog: Parse.Object) => dialog.id === dialogId);
    console.log(`[dialogNextById] Current dialog index: ${currentIndex}`);
    
    // Проверяем есть ли следующий диалог
    if (currentIndex === -1 || currentIndex === allDialogs.length - 1) {
        console.log('[dialogNextById] No next dialog found - at end of list');
        return null;
    }
    // Проверяем, что следующий индекс не выходит за пределы массива
    if (currentIndex + 1 >= allDialogs.length) {
        console.log('[dialogNextById] Next index would be out of bounds');
        return null;
    }

    const nextDialog = allDialogs[currentIndex + 1];
    console.log(`[dialogNextById] Found next dialog: ${nextDialog.id}`);

    // Создаем объект ответа в формате DIALOG_WITH_SECTION_PREVIEWS
    const item = {
        id: nextDialog.id,
        name: nextDialog.get('title'),
        situation_name: situation.get('title'),
        image: {
            type: ImageType.EMOJI,
            data: nextDialog.get('emoji') ?? "🤔",
            background: null
        },
        is_premium: nextDialog.get('is_premium')
    };

    return item;
});