import * as parse from 'parse/node';

import { getPopularSituation } from './popularSituation';
import { getNewDituation } from './newDialogs';
import { getAllTopics } from './topicsSection';

Parse.Cloud.define('appState2', async (req: any) => {

    let popularSituation = await getPopularSituation(req.params);
    let newDialogs = await getNewDituation(req.params);
    let topics = await getAllTopics(req.params);
    
    let state = {
        "home_sections": [
          popularSituation,
          newDialogs,
          topics
        ]
    }

    return state;
});


Parse.Cloud.define('appState', async (req: any) => {

    let mock = await getMock();
    return mock; 

});


async function getMock(): Promise<any> {
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
      }
}