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
exports.getAllTopics = void 0;
const i18n = __importStar(require("i18n"));
const SectionTypes_1 = require("./constants/SectionTypes");
const ImageTypes_1 = require("./constants/ImageTypes");
function getAllTopics(params) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = new Parse.Query('Topic');
        query.descending('updatedAt');
        const topics = yield query.find();
        let items = [];
        for (let topic of topics) {
            items.push({
                id: topic.id,
                image: {
                    type: ImageTypes_1.ImageType.URL,
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
                type: SectionTypes_1.SectionType.TOPIC_PREVIEWS,
                items: items
            }
        };
    });
}
exports.getAllTopics = getAllTopics;
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
