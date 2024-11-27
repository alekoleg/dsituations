import { DialogEventType } from "../Common/DialogTypes";


Parse.Cloud.job('countPopularDialogs', async (request: any) => {
    const pageSize = 1000;
    let hasMore = true;
    let skip = 0;

    const lambda = 0.1;
    const now = new Date();

    const Dialog = Parse.Object.extend('Dialog');
    const dialogRatings = new Map<typeof Dialog, number>();

    while (hasMore) {
        let query = new Parse.Query('dialog_events');
        query.include('dialog');
        query.greaterThanOrEqualTo('timestamp', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));
        query.limit(pageSize);
        query.skip(skip);
        let dialogEvents = await query.find();
        
        for (let dialogEvent of dialogEvents) {
            let dialog = dialogEvent.get('dialog');
            let event = dialogEvent.get('event') as DialogEventType;
            let timestamp = dialogEvent.get('timestamp');
            const timeDiffDays = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60 * 24);
            const weight = Math.exp(-lambda * timeDiffDays);
            const eventWeight = event === DialogEventType.Learned ? 2 : 1;
            const score = weight * eventWeight;
            dialogRatings.set(dialog, (dialogRatings.get(dialog) || 0) + score);
        }
        
        skip += dialogEvents.length;
        hasMore = dialogEvents.length === pageSize;
    }
    
    for (let [dialog, rating] of dialogRatings) {
        const DialogRating = Parse.Object.extend('dialog_ratings');
        let query = new Parse.Query(DialogRating);
        query.equalTo('dialog', dialog);
        let dialogRating = await query.first() as typeof DialogRating;
        
        if (dialogRating == null || dialogRating == undefined) {
            dialogRating = new DialogRating();
            dialogRating.set('dialog', dialog);
        }
        
        dialogRating.set('score', rating);
        
        try {
            await dialogRating.save();
        } catch (error) {
            console.error(`Error saving rating for dialog ${dialog}: ${error}`);
        }
    }
});