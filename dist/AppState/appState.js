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
const popularSituation_1 = require("./popularSituation");
Parse.Cloud.define('appState2', (req) => __awaiter(void 0, void 0, void 0, function* () {
    let popularSituation = yield (0, popularSituation_1.getPopularSituation)({});
    let state = {
        "home_sections": [
            popularSituation
        ]
    };
    return state;
}));
Parse.Cloud.define('appState', (req) => __awaiter(void 0, void 0, void 0, function* () {
    let mock = yield getMock();
    return mock;
}));
function getMock() {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            "home_sections": [
                {
                    "id": "0",
                    "title": "Popular Situations",
                    "button": {
                        "title": "Show all",
                        "action_type": "showPopularSituations"
                    },
                    "section_type": {
                        "type": "situation_previews",
                        "items": [
                            {
                                "id": "rwlfrmelgr",
                                "image": {
                                    "type": "url",
                                    "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                },
                                "name": "At the Gas Station",
                                "number_of_dialogs": 5,
                                "number_of_learnt_dialogs": 1
                            },
                            {
                                "id": "geklgjerlkg",
                                "image": {
                                    "type": "url",
                                    "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                },
                                "name": "At the Airport",
                                "number_of_dialogs": 3,
                                "number_of_learnt_dialogs": 2
                            }
                        ]
                    }
                },
                {
                    "id": "1",
                    "title": "New Dialogues",
                    "button": null,
                    "section_type": {
                        "type": "dialog_with_section_previews",
                        "items": [
                            {
                                "id": "fdfg",
                                "name": "Making a dinner reservation",
                                "situation_name": "At the Restaurant",
                                "image": {
                                    "type": "url",
                                    "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                },
                                "is_premium": false
                            },
                            {
                                "id": "gdfgdf",
                                "name": "Booking a hotel room",
                                "situation_name": "At the Hotel",
                                "image": {
                                    "type": "url",
                                    "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                },
                                "is_premium": true
                            }
                        ]
                    }
                },
                {
                    "id": "2",
                    "title": "Saved",
                    "button": {
                        "title": "Show all",
                        "action_type": "showPopularSituations"
                    },
                    "section_type": {
                        "type": "dialog_with_section_previews",
                        "items": [
                            {
                                "id": "gdfgfg",
                                "name": "Making a dinner reservation",
                                "situation_name": "At the Restaurant",
                                "image": {
                                    "type": "url",
                                    "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                },
                                "is_premium": false
                            },
                            {
                                "id": "gdfgf",
                                "name": "Booking a hotel room",
                                "situation_name": "At the Hotel",
                                "image": {
                                    "type": "url",
                                    "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                },
                                "is_premium": true
                            }
                        ]
                    }
                },
                {
                    "id": "3",
                    "title": "Featured Dialogues",
                    "button": null,
                    "section_type": {
                        "type": "paywall_preview",
                        "paywall": {
                            "image": {
                                "type": "url",
                                "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                            },
                            "title": "Try Full Access for Free",
                            "subtitle": "Unlock unlimited access to all dialogues and unlock premium features",
                            "button_title": "Get 7 Days for Free",
                            "dialogs_previews": [
                                {
                                    "id": "dfdsfdsf",
                                    "name": "Making a dinner reservation",
                                    "situation_name": "At the Restaurant",
                                    "image": {
                                        "type": "url",
                                        "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                    },
                                    "is_premium": true
                                },
                                {
                                    "id": "dfsfdsf",
                                    "name": "Booking a hotel room",
                                    "situation_name": "At the Hotel",
                                    "image": {
                                        "type": "url",
                                        "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                    },
                                    "is_premium": true
                                },
                                {
                                    "id": "fsdfdsf",
                                    "name": "Booking a hotel room",
                                    "situation_name": "At the Hotel",
                                    "image": {
                                        "type": "url",
                                        "url": "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
                                    },
                                    "is_premium": true
                                }
                            ]
                        }
                    }
                },
                {
                    "id": "4",
                    "title": "All Topics",
                    "button": null,
                    "section_type": {
                        "type": "topic_previews",
                        "items": [
                            {
                                "id": "dfsdfdsf",
                                "emoji": "💻",
                                "name": "Technology"
                            },
                            {
                                "id": "fsdfdsfd",
                                "emoji": "🌍",
                                "name": "Travel"
                            }
                        ]
                    }
                }
            ]
        };
    });
}
