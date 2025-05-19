import { setupCorrectLocale } from '../languageUtils';
import { SituationPreviewModel } from '../Models/SituationPreview';

Parse.Cloud.define('situationGetPopulars', async (req: any): Promise<any> => {
    setupCorrectLocale(req);
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
