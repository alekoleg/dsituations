import { ImageType } from "../Common/ImageTypes";

export interface Dialog {
    id: string;
    title: string;
    subtitle: string;
    image: {
        type: String;
        url: string;
    };
    is_learnt: boolean;
    premium: boolean;
    lines: any[];
}

export class DialogModel implements Dialog {
    id: string;
    title: string;
    subtitle: string;
    image: {
        type: String;
        url: string;
    };
    is_learnt: boolean;
    premium: boolean;
    lines: any[];

    constructor(data: Dialog) {
        this.id = data.id;
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.image = data.image;
        this.is_learnt = data.is_learnt;
        this.premium = data.premium;
        this.lines = data.lines;
    }

    static async fromParse(dialog: Parse.Object): Promise<DialogModel> {
        return new DialogModel({
            id: dialog.id,
            title: dialog.get('title'),
            subtitle: dialog.get('subtitle'),
            image: {
                type: ImageType.URL,
                url: dialog.get('image_link') || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            is_learnt: dialog.get('is_learnt') ?? false,
            premium: dialog.get('premium') ?? false,
            lines: []
        });
    }

    toJSON(): Dialog {
        return {
            id: this.id,
            title: this.title,
            subtitle: this.subtitle,
            image: this.image,
            is_learnt: this.is_learnt,
            premium: this.premium,
            lines: this.lines
        };
    }
}