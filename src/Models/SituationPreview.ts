import { ImageType } from '../Common/ImageTypes';

export interface SituationPreview {
    id: string;
    image: {
        type: String;
        url: string;
    };
    name: string;
    number_of_dialogs: number;
}

export class SituationPreviewModel implements SituationPreview {
    id: string;
    image: {
        type: String;
        url: string;
    };
    name: string;
    number_of_dialogs: number;

    constructor(data: SituationPreview) {
        this.id = data.id;
        this.image = data.image;
        this.name = data.name;
        this.number_of_dialogs = data.number_of_dialogs;
    }

    static async fromParse(situation: Parse.Object): Promise<SituationPreviewModel> {
        return new SituationPreviewModel({
            id: situation.id,
            image: {
                type: ImageType.URL,
                url: situation.get('image_link') || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            name: situation.get('title'),
            number_of_dialogs: situation.get('dialogs_count') ?? 0
        });
    }

    toJSON(): SituationPreview {
        return {
            id: this.id,
            image: this.image,
            name: this.name,
            number_of_dialogs: this.number_of_dialogs
        };
    }
} 