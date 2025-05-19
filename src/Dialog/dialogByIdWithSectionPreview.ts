import * as parse from 'parse/node';
import { ImageType } from '../Common/ImageTypes';
import { setupCorrectLocale } from '../languageUtils';

Parse.Cloud.define('dialogByIdWithSectionPreview', async (req: any) => {
    setupCorrectLocale(req);
    const dialogId = req.params.id;
    if (!dialogId) {
        throw new Error('Dialog ID is required');
    }

    // Получаем текущий диалог
    let dialogQuery = new Parse.Query('Dialog');
    let currentDialog = await dialogQuery.get(dialogId);
    
    // Получаем связанную ситуацию
    let situation = await currentDialog.get('situation').fetch();

    const item = {
        id: currentDialog.id,
        name: currentDialog.get('title'),
        situation_name: situation.get('title'),
        image: {
            type: ImageType.EMOJI,
            data: currentDialog.get('emoji') ?? "🤔",
            background: null
        },
        is_premium: currentDialog.get('is_premium')
    };

    return item;
});