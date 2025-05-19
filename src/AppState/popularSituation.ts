import { ActionType } from '../Common/ActionTypes';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';
import { SituationPreviewModel } from '../Models/SituationPreview';

export async function getPopularSituation(req: any, params: any): Promise<any> {

    let query = new Parse.Query('Situation');
    query.limit(5);
    query.descending('updatedAt');
    query.notEqualTo('hidden', true);
    const situations = await query.find();

    const items = await Promise.all(
        situations.map(situation => SituationPreviewModel.fromParse(situation))
    );
 

    console.log('title');
    console.log(req.__("AppState_Popular_Situations"));
    return {
        id: "0",
        title: req.__("AppState_Popular_Situations"),
        button: {
            title: req.__("AppState_Button_Title_Show_All"),
            action_type: ActionType.SHOW_POPULAR_SITUATIONS
        },
        section_type: {
            type: SectionType.SITUATION_PREVIEWS,
            items: items.map(item => item.toJSON())
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