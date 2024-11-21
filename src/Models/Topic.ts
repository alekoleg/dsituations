import * as Parse from 'parse/node';
import { ImageType } from '../Common/ImageTypes';
import { SituationPreviewModel, SituationPreview } from './SituationPreview';

export interface TopicResponse {
    id: string;
    image: {
        type: String;
        url: string;
    };
    name: string;
    situations_previews: SituationPreview[];
}

export class TopicModel implements TopicResponse {
    id: string;
    image: {
        type: String;
        url: string;
    };
    name: string;
    situations_previews: SituationPreviewModel[];

    constructor(data: TopicResponse) {
        this.id = data.id;
        this.image = data.image;
        this.name = data.name;
        this.situations_previews = data.situations_previews.map(situation => new SituationPreviewModel(situation));
    }

    static fromParse(topic: Parse.Object): TopicModel {
        return new TopicModel({
            id: topic.id,
            image: {
                type: ImageType.URL,
                url: topic.get("image_link") || "https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg"
            },
            name: topic.get('title'),
            situations_previews: []
        });
    }

    toJSON(): TopicResponse {
        return {
            id: this.id,
            image: this.image,
            name: this.name,
            situations_previews: this.situations_previews.map(situation => situation.toJSON())
        };
    }
} 