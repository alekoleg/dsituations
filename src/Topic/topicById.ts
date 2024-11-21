import * as parse from 'parse/node';
import { ImageType } from '../Common/ImageTypes';
import { SituationPreviewModel } from '../Models/SituationPreview';
import { TopicModel } from '../Models/Topic';

Parse.Cloud.define('topicsById', async (req: any) => {

    const topicId = req.params.id;
    if (!topicId) {
        throw new Error('Topic ID is required');
    }
    
    let query = new Parse.Query('Topic');
    let topic = await query.get(topicId);
    
    let results = await topic.relation('situations').query().find();
    let situations_previews = await Promise.all(
        results.map(situation => SituationPreviewModel.fromParse(situation))
    );

    let topicModel = TopicModel.fromParse(topic);
    topicModel.situations_previews = situations_previews;

    return topicModel.toJSON();    
});

