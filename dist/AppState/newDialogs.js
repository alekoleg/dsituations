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
exports.getNewDituation = void 0;
const i18n = __importStar(require("i18n"));
const SectionTypes_1 = require("./constants/SectionTypes");
const ImageTypes_1 = require("./constants/ImageTypes");
function getNewDituation(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = new Parse.Query('Dialog');
        query.limit(5);
        query.descending('updatedAt');
        query.include('situation');
        const objects = yield query.find();
        let items = [];
        for (let object of objects) {
            let situation = object.get('situation');
            items.push({
                id: object.id,
                name: object.get('title'),
                situation_name: situation.get('title'),
                image: {
                    type: ImageTypes_1.ImageType.URL,
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
                type: SectionTypes_1.SectionType.DIALOG_WITH_SECTION_PREVIEWS,
                items: items
            }
        };
    });
}
exports.getNewDituation = getNewDituation;
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