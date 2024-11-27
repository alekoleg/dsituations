import { DialogEventType } from "../Common/DialogTypes";

Parse.Cloud.define('dialogMarkAs', async (req: any) => {

    let dialogId = req.params.dialogId;
    let event = req.params.event;
    
    if (!dialogId) {
        throw new Error('Dialog ID is required');
    }

    // Проверяем, что полученное значение event является допустимым DialogEventType
    if (!Object.values(DialogEventType).includes(event)) {
        throw new Error(`Unsupported: ${event}`);
    }
    // После проверки можно безопасно привести к типу
    event = event as DialogEventType;

    // fetch dialog
    let dialog = await new Parse.Query('Dialog').get(dialogId);

    if (!dialog) {
        throw new Error('Dialog not found');
    }

    let object = new Parse.Object('dialog_events');
    object.set('dialog', dialog);
    object.set('event', event);
    object.set('user', req.user);
    object.set('timestamp', new Date());
    await object.save();
});