
import * as i18n from 'i18n';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getPaywallSection(params: any): Promise<any> {

    let query = new Parse.Query('Dialog');
    query.limit(3);
    query.ascending('updatedAt');
    query.equalTo('is_premium', true);
    
    const objects = await query.find();

    let items = [];
    for (let dialog of objects) {
        let situation = dialog.get('situation');
        await situation.fetch();
        
        items.push({
            id: dialog.id,
            name: dialog.get('title'),
            situation_name: situation.get('title'),
            image: {
                type: ImageType.URL,
                url: dialog.get('image_link') || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            is_premium: dialog.get('is_premium')
        });
    }

    return {
        id: "4",
        title: i18n.__("AppState_Paywall_Title"),
        button: null,
        section_type: {
            type: SectionType.PAYWALL_DIALOG_PREVIEW,
            // items: items,
            paywall: {
                image: {
                    type: ImageType.URL,
                    url: "https://dialogsstorage.fra1.cdn.digitaloceanspaces.com/images/paywallStar.png"
                },
                title: i18n.__("AppState_Paywall_Dialogs_Previews_Title"),
                subtitle: i18n.__("AppState_Paywall_Dialogs_Previews_Subtitle"),
                button_title: i18n.__("AppState_Paywall_Dialogs_Previews_Button_Title"),
                dialogs_previews: items
            }
        }
    }
}


// {
//     "id": "3",
//     "title": "Featured Dialogues",
//     "button": null,
//     "section_type": {
//       "type": "paywall_preview",
//       "paywall": {
//         "image": {
//           "type": "url",
//           "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//         },
//         "title": "Try Full Access for Free",
//         "subtitle": "Unlock unlimited access to all dialogues and unlock premium features",
//         "button_title": "Get 7 Days for Free",
//         "dialogs_previews": [
//           {
//             "id": "dfdsfdsf",
//             "name": "Making a dinner reservation",
//             "situation_name": "At the Restaurant",
//             "image": {
//               "type": "url",
//               "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//             },
//             "is_premium": true
//           },
//           {
//             "id": "dfsfdsf",
//             "name": "Booking a hotel room",
//             "situation_name": "At the Hotel",
//             "image": {
//               "type": "url",
//               "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//             },
//             "is_premium": true
//           },
//           {
//             "id": "fsdfdsf",
//             "name": "Booking a hotel room",
//             "situation_name": "At the Hotel",
//             "image": {
//               "type": "url",
//               "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
//             },
//             "is_premium": true
//           }
//         ]
//       }
//     }
//   },