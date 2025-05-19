import * as parse from 'parse/node';
import { ImageType } from '../Common/ImageTypes';
import { SituationPreviewModel } from '../Models/SituationPreview';
import { TopicModel } from '../Models/Topic';
import { setupCorrectLocale } from '../languageUtils';

Parse.Cloud.define('topicById', async (req: any) => {
    setupCorrectLocale(req);
    const topicId = req.params.id;
    if (!topicId) {
        throw new Error('Topic ID is required');
    }
    
    let query = new Parse.Query('Topic');
    let topic = await query.get(topicId);
    
    let situationsQuery = await topic.relation('situations').query();
    situationsQuery.notEqualTo('hidden', true);
    let situations = await situationsQuery.find();

    let situations_previews = await Promise.all(
        situations.map(situation => SituationPreviewModel.fromParse(situation))
    );

    let topicModel = TopicModel.fromParse(topic);
    topicModel.situations_previews = situations_previews;

    return topicModel.toJSON();    
});

