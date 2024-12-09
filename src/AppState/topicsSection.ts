import * as i18n from 'i18n';
import { ActionType } from '../Common/ActionTypes';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getAllTopics(params: any): Promise<any> {

    let query = new Parse.Query('Topic');
    query.ascending('order');
    query.notEqualTo('hidden', true);
    const topics = await query.find();

    let items = [];
    for (let topic of topics) {
        
        items.push({
            id: topic.id,
            image: {
                type: ImageType.URL,
                url: topic.get('image_link') || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            
            name: topic.get('title'),
        });
    }
 
    return {
        id: "9",
        title: i18n.__("AppState_All_Topics"),
        section_type: {
            type: SectionType.TOPIC_PREVIEWS,
            items: items
        }
    }
}
