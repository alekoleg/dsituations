// import * as Parse from 'parse/node';
import { APIKeys } from './configs/keys';

export module DB {
    export async function storeWrods(words: Array<any>): Promise<Array<Parse.Object>> {
        var results = [];
        for (let word of words) {
            console.log(`Storing word: ${word}`);
            var title = word["title"];
            var query = new Parse.Query("Word");
            query.equalTo(APIKeys.InfinitiveKey, title);
            var object = await query.first();
            if (object == null) {
                object = new Parse.Object("Word");
                object.set(APIKeys.InfinitiveKey, title);
                object.set(APIKeys.VariantsKey, word["forms"]);
            }
            var searchVariants = object.get(APIKeys.SearchVariants) ?? [];
            searchVariants.push(word["origin"]);
            object.set(APIKeys.SearchVariants, searchVariants);
            await object.save();     
            results.push(object);     
        }

        console.log(`Storing words: ${words}`);
        return results;
        // Store words to database
    }

    export async function getWord(input: string): Promise<Parse.Object<Parse.Attributes> | undefined> {
        var checkInfinitiveQuery = new Parse.Query("Word");
        checkInfinitiveQuery.equalTo(APIKeys.InfinitiveKey, input);
        var chckSearchVariantsQuery = new Parse.Query("Word");
        chckSearchVariantsQuery.contains(APIKeys.SearchVariants, input);
        const finalQuery = Parse.Query.or(checkInfinitiveQuery, chckSearchVariantsQuery);
        var object = await finalQuery.first();
        return object;
    }
}