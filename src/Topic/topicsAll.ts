import * as parse from 'parse/node';
import { ImageType } from '../Common/ImageTypes';
import { SituationPreviewModel } from '../Models/SituationPreview';

Parse.Cloud.define('topicsAll', async (req: any) => {

    const offset = req.params.offset ?? 0;
    const pageSize = 20;
    
    let query = new Parse.Query('Topic');
    query.ascending('order');
    query.skip(offset)
    query.limit(pageSize);
    query.notEqualTo('hidden', true);
    const topics = await query.find();

    let items = [];
    for (let topic of topics) {
        
        const previewCount = 5;
        const situationQuery = await topic.relation('situations').query()
        situationQuery.limit(previewCount + 1);
        const results = await situationQuery.find();
        let trimmedResults = results;
        if (results.length >= previewCount) {
            trimmedResults = results.slice(0, previewCount);
        }

        var situations_previews = await Promise.all(
            trimmedResults.map(situation => SituationPreviewModel.fromParse(situation))
        );
        
        items.push({
            id: topic.id,
            image: {
                type: ImageType.URL,
                url: topic.get("image_link") || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            name: topic.get('title'),
            situations_previews: situations_previews.map(situation => situation.toJSON()),
            has_more: results.length > previewCount
        });
    }
 
    return {
        items: items,
        offset: offset + topics.length
    }
});

