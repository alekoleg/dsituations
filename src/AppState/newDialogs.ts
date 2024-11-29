import * as i18n from 'i18n';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getNewDialogs(params: any): Promise<any> {

    let query = new Parse.Query('Dialog');
    query.limit(5);
    query.descending('updatedAt');
    query.include('situation');
    const objects = await query.find();

    let items = [];
    for (let object of objects) {
        let situation = object.get('situation');
        
        items.push({
            id: object.id,
            name: object.get('title'),
            situation_name: situation.get('title'),
            image: {
                type: ImageType.URL,
                url: "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                // url: situation.get('image_link')
            },
            is_premium: object.get('is_premium')
        });
    }

    return {
        id: "1",
        title: i18n.__("AppState_New_Dialogs"),
        button: null,
        section_type: {
            type: SectionType.DIALOG_WITH_SECTION_PREVIEWS,
            items: items
        }
    }
}


// {
//     "id": "1",
//     "title": "New Dialogues",
//     "button": null,
//     "section_type": {
//       "type": "dialog_with_section_previews",
//       "items": [
//         {
//           "id": "fdfg",
//           "name": "Making a dinner reservation",
//           "situation_name": "At the Restaurant",
//           "image": {
//             "type": "url",
//             "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//           },
//           "is_premium": false
//         },
//         {
//           "id": "gdfgdf",
//           "name": "Booking a hotel room",
//           "situation_name": "At the Hotel",
//           "image": {
//             "type": "url",
//             "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//           },
//           "is_premium": true
//         }
//       ]
//     }
//   },