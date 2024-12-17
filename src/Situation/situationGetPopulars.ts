import { SituationPreviewModel } from '../Models/SituationPreview';

Parse.Cloud.define('situationGetPopulars', async (params: any): Promise<any> => {

    let query = new Parse.Query('Situation');
    query.limit(25);
    query.notEqualTo('hidden', true);
    query.descending('updatedAt');
    const situations = await query.find();

    const items = await Promise.all(
        situations.map(situation => SituationPreviewModel.fromParse(situation))
    );

    return { items: items.map(item => item.toJSON()) };
});
