import * as parse from 'parse/node';
import { SituationPreviewModel } from '../Models/SituationPreview';
import { DialogModel } from '../Models/Dialog';

Parse.Cloud.job('countDialogsForSituation', async (request: any) => {

    const pageSize = 100;
    let hasMore = true;
    var skip = 0;

    while (hasMore) {
        let query = new Parse.Query('Situation');
        query.limit(pageSize);
        query.skip(skip);
        let situations = await query.find();
        for (let situation of situations) {
            let relationQuery = situation.relation('dialogs').query();
            let count = await relationQuery.count();
            situation.set('dialogs_count', count);
            await situation.save(); 
        }

        skip += situations.length;
        hasMore = situations.length === pageSize;
    }
});

