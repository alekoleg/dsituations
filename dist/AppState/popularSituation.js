"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const i18n = __importStar(require("i18n"));
const ActionTypes_1 = require("../Common/ActionTypes");
const SectionTypes_1 = require("../Common/SectionTypes");
const SituationPreview_1 = require("../Models/SituationPreview");
function getPopularSituation(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = new Parse.Query('Situation');
        query.limit(5);
        query.descending('updatedAt');
        const situations = yield query.find();
        const items = yield Promise.all(situations.map(situation => SituationPreview_1.SituationPreviewModel.fromParse(situation)));
        return {
            id: "0",
            title: i18n.__("AppState_Popular_Situations"),
            button: {
                title: i18n.__("AppState_Button_Title_Show_All"),
                action_type: ActionTypes_1.ActionType.SHOW_POPULAR_SITUATIONS
            },
            section_type: {
                type: SectionTypes_1.SectionType.SITUATION_PREVIEWS,
                items: items.map(item => item.toJSON())
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
