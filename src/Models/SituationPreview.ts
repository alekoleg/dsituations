import { ImageType } from '../Common/ImageTypes';
import { DialogModel, Dialog } from './Dialog';

export interface SituationPreview {
    id: string;
    image: {
        type: String;
        url: string;
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
        url: string;
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
        return new SituationPreviewModel({
            id: situation.id,
            image: {
                type: ImageType.URL,
                url: situation.get('image_link') || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
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