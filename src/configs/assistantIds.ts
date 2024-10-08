export module AssistantsIdConfig {

    export class AssistantsId {
        private language: string;

        private recognitionsIds: Record<string, string> = {
            "et": "asst_VGmQLWfualDhFnDTfiL5ScDM"
        }

        constructor() {
            this.language = "et";
        }

        getRecognitionId(): string {
            return this.recognitionsIds[this.language];
        }
    }
}
