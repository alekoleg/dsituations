import { LineType } from '../Common/LineTypes';

export interface InteractiveElement {
    id: string;
    type: LineType;
    dialog: string; // ID диалога, к которому относится элемент
    order: number; // Порядок элемента в диалоге
    level: string;
    data: any; // Данные элемента в зависимости от типа
}

export class InteractiveElementModel implements InteractiveElement {
    id: string;
    type: LineType;
    dialog: string;
    order: number;
    level: string;
    data: any;

    constructor(data: InteractiveElement) {
        this.id = data.id;
        this.type = data.type;
        this.dialog = data.dialog;
        this.order = data.order;
        this.level = data.level;
        this.data = data.data;
    }

    static async fromParse(element: Parse.Object): Promise<InteractiveElementModel> {
        return new InteractiveElementModel({
            id: element.id,
            type: element.get('type') as LineType,
            dialog: element.get('dialog').id,
            order: element.get('order'),
            level: element.get('level'),
            data: element.get('data')
        });
    }

    toJSON(): InteractiveElement {

        const dataStructure = JSON.parse(this.data);
        return {
            id: this.id,
            type: this.type,
            dialog: this.dialog,
            order: this.order,
            level: this.level,
            data: dataStructure
        };
    }
} 