import * as i18n from 'i18n';
import { ActionType } from './constants/ActionTypes';
import { SectionType } from './constants/SectionTypes';
import { ImageType } from './constants/ImageTypes';

export async function getPopularSituation(params: any): Promise<any> {

    let query = new Parse.Query('Situation');
    query.limit(5);
    query.descending('updatedAt');
    const situations = await query.find();

    let items = [];
    for (let situation of situations) {
        let relation = situation.relation('dialogs');
        let count = await relation.query().count();
        items.push({
            id: situation.id,
            image: {
                type: ImageType.URL,
                url: "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                // url: situation.get('image_link')
            },
            name: situation.get('title'),
            number_of_dialogs: count
        });
    }
 
    return {
        id: "0",
        title: i18n.__("AppState_Popular_Situations"),
        button: {
            title: i18n.__("AppState_Button_Title_Show_All"),
            action_type: ActionType.SHOW_POPULAR_SITUATIONS
        },
        section_type: {
            type: SectionType.SITUATION_PREVIEWS,
            items: items
        }
    }
}




// {
//     "id": "0",
//     "title": "Popular Situations",
//     "button": {
//       "title": "Show all",
//       "action_type": "showPopularSituations"
//     },
//     "section_type": {
//       "type": "situation_previews",
//       "items": [
//         {
//           "id": "rwlfrmelgr",
//           "image": {
//             "type": "url",
//             "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//           },
//           "name": "At the Gas Station",
//           "number_of_dialogs": 5,
//           "number_of_learnt_dialogs": 1
//         },
//         {
//           "id": "geklgjerlkg",
//           "image": {
//             "type": "url",
//             "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//           },
//           "name": "At the Airport",
//           "number_of_dialogs": 3,
//           "number_of_learnt_dialogs": 2
//         }
//       ]
//     }
//   },