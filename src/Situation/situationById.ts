import * as parse from 'parse/node';
import { SituationPreviewModel } from '../Models/SituationPreview';
import { DialogModel } from '../Models/Dialog';

Parse.Cloud.define('situationById', async (req: any) => {

    const situationId = req.params.id;
    if (!situationId) {
        throw new Error('Situation ID is required');
    }

    let query = new Parse.Query('Situation');
    let situation = await query.get(situationId);
    
    let relationQuery = situation.relation('dialogs').query();
    relationQuery.limit(1000);
    relationQuery.ascending('createdAt');
    let results = await relationQuery.find();
    console.log(results);
    let dialogs = await Promise.all(
        results.map(dialog => DialogModel.fromParse(dialog))
    );

    let situationModel = await SituationPreviewModel.fromParse(situation);
    situationModel.dialogs = dialogs;

    return situationModel.toJSON();    
});

