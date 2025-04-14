import { ImageType } from "../Common/ImageTypes";
import { SituationPreview, SituationPreviewModel } from "./SituationPreview";

export interface Dialog {
    id: string;
    title: string;
    subtitle: string;
    image: {
        type: String;
        data: string;
    };
    is_learnt: boolean;
    is_premium: boolean;
    lines: any[];
    situation: SituationPreview | null;
}

export class DialogModel implements Dialog {
    id: string;
    title: string;
    subtitle: string;
    image: {
        type: String;
        data: string;
    };
    is_learnt: boolean;
    is_premium: boolean;
    lines: any[];
    situation: SituationPreview | null;

    constructor(data: Dialog) {
        this.id = data.id;
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.image = data.image;
        this.is_learnt = data.is_learnt;
        this.is_premium = data.is_premium;
        this.lines = data.lines;
        this.situation = data.situation;
    }

    static async fromParse(dialog: Parse.Object): Promise<DialogModel> {
        let situation = null;
        if (dialog.get('situation')) {
            situation = await SituationPreviewModel.fromParse(dialog.get('situation'));
        }

        return new DialogModel({
            id: dialog.id,
            title: dialog.get('title'),
            subtitle: dialog.get('subtitle'),
            image: {
                type: ImageType.EMOJI,
                data: dialog.get('emoji') ?? "🤔",
            },
            is_learnt: dialog.get('is_learnt') ?? false,
            is_premium: dialog.get('is_premium') ?? false,
            lines: [],
            situation: situation
        });
    }
    
    toJSON(): Dialog {
        return {
            id: this.id,
            title: this.title,
            subtitle: this.subtitle,
            image: this.image,
            is_learnt: this.is_learnt,
            is_premium: this.is_premium,
            lines: this.lines,
            situation: this.situation
        };
    }
}