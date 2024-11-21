import * as i18n from 'i18n';
import { ActionType } from '../Common/ActionTypes';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getAllTopics(params: any): Promise<any> {

    let query = new Parse.Query('Topic');
    query.descending('updatedAt');
    const topics = await query.find();

    let items = [];
    for (let topic of topics) {
        
        items.push({
            id: topic.id,
            image: {
                type: ImageType.URL,
                url: "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                // url: situation.get('image_link')
            },
            
            name: topic.get('title'),
        });
    }
 
    return {
        id: "4",
        title: i18n.__("AppState_All_Topics"),
        section_type: {
            type: SectionType.TOPIC_PREVIEWS,
            items: items
        }
    }
}



// {
//     "id": "4",
//     "title": "All Topics",
//     "button": null,
//     "section_type": {
//       "type": "topic_previews",
//       "items": [
//         {
//           "id": "dfsdfdsf",
//           "emoji": "💻",
//           "name": "Technology"
//         },
//         {
//           "id": "fsdfdsfd",
//           "emoji": "🌍",
//           "name": "Travel"
//         }
//       ]
//     }
//   }