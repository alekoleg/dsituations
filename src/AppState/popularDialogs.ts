import * as i18n from 'i18n';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getPopularDialogs(params: any): Promise<any> {

    let query = new Parse.Query('dialog_ratings');
    query.include('dialog');
    query.limit(5);
    query.descending('score');
    query.notEqualTo('hidden', true);
    query.include('dialog');
    const objects = await query.find();

    let items = [];
    
    for (let object of objects) {
        let dialog = object.get('dialog');
        if (!dialog) {
            continue;
        }
        
        let situation = dialog.get('situation');
        if (!situation) {
            continue;
        }
        
        await situation.fetch();
        
        const itemToAdd = {
            id: dialog.id,
            name: dialog.get('title'),
            situation_name: situation.get('title'),
            image: {
                type: ImageType.EMOJI,
                data: dialog.get('emoji') ?? "🤔",
                background: null
            },
            is_premium: dialog.get('is_premium')
        };
        
        items.push(itemToAdd);
    }

    if (items.length === 0) {
        return null;
    }
    
    return {
        id: "1",
        title: i18n.__("AppState_Popular_Dialogs"),
        button: null,
        section_type: {
            type: SectionType.DIALOG_WITH_SECTION_PREVIEWS,
            items: items
        }
    }
}