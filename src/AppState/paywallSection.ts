import * as i18n from 'i18n';
import { SectionType } from '../Common/SectionTypes';
import { ImageType } from '../Common/ImageTypes';

export async function getPaywallSection(params: any): Promise<any> {
    // Получаем ситуации
    let situationQuery = new Parse.Query('Situation');
    situationQuery.limit(3);
    situationQuery.ascending('updatedAt');
    const situations = await situationQuery.find();

    let items = [];
    for (let situation of situations) {
        // Получаем диалоги через relation
        const dialogsRelation = situation.relation('dialogs');
        const dialogQuery = dialogsRelation.query();
        dialogQuery.equalTo('is_premium', true);
        dialogQuery.notEqualTo('hidden', true);
        dialogQuery.limit(1);
        
        const dialog = await dialogQuery.first();
        if (dialog) {
            items.push({
                id: dialog.id,
                name: dialog.get('title'),
                situation_name: situation.get('title'),
                image: {
                    type: ImageType.EMOJI,
                    data: dialog.get('emoji') ?? "🤔",
                    background: null
                },
                is_premium: dialog.get('is_premium')
            });
        }
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
                    data: "https://dialogs.fra1.cdn.digitaloceanspaces.com/images/paywallStar.png"
                },
                title: i18n.__("AppState_Paywall_Dialogs_Previews_Title"),
                subtitle: i18n.__("AppState_Paywall_Dialogs_Previews_Subtitle"),
                button_title: i18n.__("AppState_Paywall_Dialogs_Previews_Button_Title"),
                dialogs_previews: items,
                total_paid_dialogs: i18n.__("AppState_Paywall_Dialogs_Previews_Total_Paid_Dialogs").replace("%s", "330")
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