import * as parse from 'parse/node';
import { getPopularSituation } from './popularSituation';
import { getNewDialogs } from './newDialogs';
import { getAllTopics } from './topicsSection';
import { getPopularDialogs } from './popularDialogs';
import { getPaywallSection } from './paywallSection';
import { setupCorrectLocale } from '../languageUtils';

Parse.Cloud.define('appState', async (req: any) => {
    setupCorrectLocale(req);

    let popularSituation = await getPopularSituation(req, req.params);
    let newDialogs = await getNewDialogs(req, req.params);
    let popularDialogs = await getPopularDialogs(req, req.params);
    let topics = await getAllTopics(req, req.params);
    let paywall = await getPaywallSection(req, req.params);
    
    let state = {
        "home_sections": [
          popularSituation,
          newDialogs,
          popularDialogs,
          paywall,
          topics
        ].filter(section => section !== null),
        "total_number_of_dialogs": 330
    }

    return state;
});