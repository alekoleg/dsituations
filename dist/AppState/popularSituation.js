"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularSituation = void 0;
function getPopularSituation(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = new Parse.Query('Situation');
        query.limit(5);
        query.descending('updatedAt');
        const situations = yield query.find();
        let items = [];
        for (let situation of situations) {
            let relation = situation.relation('dialogs');
            let count = yield relation.query().count();
            items.push({
                id: situation.id,
                image: {
                    type: "url",
                    url: "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                    // url: situation.get('image_link')
                },
                name: situation.get('title'),
                number_of_dialogs: count
            });
        }
        return {
            id: "0",
            title: "Popular Situations",
            button: {
                title: "Show all",
                action_type: "showPopularSituations"
            },
            section_type: {
                type: "situation_previews",
                items: items
            }
        };
    });
}
exports.getPopularSituation = getPopularSituation;
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
