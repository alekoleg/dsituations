import { ImageType } from '../Common/ImageTypes';
import { DialogModel, Dialog } from './Dialog';

export interface SituationPreview {
    id: string;
    image: {
        type: String;
        data: string;
        background: string | null;
    };
    name: string;
    subtitle: string | null;
    number_of_dialogs: number;
    dialogs: Dialog[];
}

export class SituationPreviewModel implements SituationPreview {
    id: string;
    image: {
        type: String;
        data: string;
        background: string | null;
    };
    name: string;
    subtitle: string | null;
    number_of_dialogs: number;
    dialogs: DialogModel[];

    constructor(data: SituationPreview) {
        this.id = data.id;
        this.image = data.image;
        this.name = data.name;
        this.subtitle = data.subtitle;
        this.number_of_dialogs = data.number_of_dialogs;
        this.dialogs = data.dialogs.map(dialog => new DialogModel(dialog));
    }

    static async fromParse(situation: Parse.Object): Promise<SituationPreviewModel> {
        var imageData = situation.get('image_link') 
        var imageType: string = ImageType.URL
        if (imageData == null) {
            imageData = situation.get('emoji')
            imageType = ImageType.EMOJI
        }
        return new SituationPreviewModel({
            id: situation.id,
            image: {
                type: imageType,
                data: imageData,
                background: null
            },
            name: situation.get('title'),
            subtitle: situation.get('subtitle') || null,
            number_of_dialogs: situation.get('dialogs_count') ?? 0,
            dialogs: []
        });
    }

    toJSON(): SituationPreview {
        return {
            id: this.id,
            image: this.image,
            name: this.name,
            subtitle: this.subtitle,
            number_of_dialogs: this.number_of_dialogs,
            dialogs: this.dialogs.map(dialog => dialog.toJSON())
        };
    }
}