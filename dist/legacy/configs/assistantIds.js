"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistantsIdConfig = void 0;
var AssistantsIdConfig;
(function (AssistantsIdConfig) {
    class AssistantsId {
        constructor() {
            this.recognitionsIds = {
                "et": "asst_VGmQLWfualDhFnDTfiL5ScDM"
            };
            this.language = "et";
        }
        getRecognitionId() {
            return this.recognitionsIds[this.language];
        }
    }
    AssistantsIdConfig.AssistantsId = AssistantsId;
})(AssistantsIdConfig || (exports.AssistantsIdConfig = AssistantsIdConfig = {}));
