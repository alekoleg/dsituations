"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
// import * as Parse from 'parse/node';
const keys_1 = require("../configs/keys");
var DB;
(function (DB) {
    function storeWrods(words) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var results = [];
            for (let word of words) {
                console.log(`Storing word: ${word}`);
                var title = word["title"];
                var query = new Parse.Query("Word");
                query.equalTo(keys_1.APIKeys.InfinitiveKey, title);
                var object = yield query.first();
                if (object == null) {
                    object = new Parse.Object("Word");
                    object.set(keys_1.APIKeys.InfinitiveKey, title);
                    object.set(keys_1.APIKeys.VariantsKey, word["forms"]);
                }
                var searchVariants = (_a = object.get(keys_1.APIKeys.SearchVariants)) !== null && _a !== void 0 ? _a : [];
                searchVariants.push(word["origin"]);
                object.set(keys_1.APIKeys.SearchVariants, searchVariants);
                yield object.save();
                results.push(object);
            }
            console.log(`Storing words: ${words}`);
            return results;
        });
    }
    DB.storeWrods = storeWrods;
    function getWord(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var checkInfinitiveQuery = new Parse.Query("Word");
            checkInfinitiveQuery.equalTo(keys_1.APIKeys.InfinitiveKey, input);
            var chckSearchVariantsQuery = new Parse.Query("Word");
            chckSearchVariantsQuery.contains(keys_1.APIKeys.SearchVariants, input);
            const finalQuery = Parse.Query.or(checkInfinitiveQuery, chckSearchVariantsQuery);
            var object = yield finalQuery.first();
            return object;
        });
    }
    DB.getWord = getWord;
})(DB || (exports.DB = DB = {}));
