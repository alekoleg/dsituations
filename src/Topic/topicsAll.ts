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
    const topics = await query.find();

    let items = [];
    for (let topic of topics) {
        var results = await topic.relation('situations').query().find();
        var situations_previews = await Promise.all(
            results.map(situation => SituationPreviewModel.fromParse(situation))
        );
        
        items.push({
            id: topic.id,
            image: {
                type: ImageType.URL,
                url: topic.get("image_link") || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            name: topic.get('title'),
            situations_previews: situations_previews.map(situation => situation.toJSON())
        });
    }
 
    return {
        items: items,
        offset: offset + topics.length
    }
});

