import * as i18n from 'i18n';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getPopularDialogs(params: any): Promise<any> {

    let query = new Parse.Query('dialog_ratings');
    query.include('dialog');
    query.limit(5);
    query.descending('score');
    query.notEqualTo('hidden', true);
    const objects = await query.find();

    let items = [];
    for (let object of objects) {
        let dialog = object.get('dialog');
        let situation = dialog.get('situation');
        await situation.fetch();
        
        items.push({
            id: dialog.id,
            name: dialog.get('title'),
            situation_name: situation.get('title'),
            image: {
                type: ImageType.URL,
                url: "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                // url: situation.get('image_link')
            },
            is_premium: dialog.get('is_premium')
        });
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