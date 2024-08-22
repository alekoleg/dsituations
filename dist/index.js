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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var ParseServer = require('parse-server').ParseServer;
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        // test
        const DB_HOST = 'mongodb+srv://doadmin:nuf3A1954Pe7da82@dbaas-db-3578739-4bb2362b.mongo.ondigitalocean.com/admin?tls=true&authSource=admin&replicaSet=dbaas-db-3578739';
        // dev 
        // const DB_HOST = 'mongodb://localhost:27017/reading'
        // const SERVER_URL = "http://test.reading.alekoleg.com:8080/api/parse"
        // prod
        const SERVER_URL = 'http://127.0.0.1:9090/api/parse';
        // serverURL: 'http://reading.alekoleg.com:8080/api/parse' // Don't forget to change to https if needed
        // Specify the connection string for your mongodb database
        // and the location to your Parse cloud code
        const server = new ParseServer({
            databaseURI: DB_HOST,
            cloud: __dirname + '/cloud.js', // Provide an absolute path
            appId: "dhsuadghdfkjgjw3p1209410sdfvmoi3",
            masterKey: "djhiu3u808ger9j328ger98g2309k1!", // Keep this key secret!
            fileKey: null,
            serverURL: SERVER_URL, // Don't forget to change to https if needed
            publicServerURL: SERVER_URL,
            // Your apps name. This will appear in the subject and body of the emails that are sent.
            appName: 'Situations app',
            expireInactiveSessions: false,
            sessionLength: 10 * 360 * 86400 // 10 years
            //   emailAdapter: {
            //     module: '@parse/simple-mailgun-adapter',
            //     options: {
            //       // The address that your emails come from
            //       fromAddress: 'noreplay@reading.alekoleg.com',
            //       // Your domain from mailgun.com
            //       domain: "reading.alekoleg.com",
            //       // Your API key from mailgun.com
            //       apiKey: '57ccc37fbbca0fbe5513eee284f7bce17e5-db855e51',
            //     }
            //   }
        });
        yield server.start();
        // Serve the Parse API on the /parse URL prefix
        app.use('/static', express_1.default.static(__dirname + '/public/'));
        app.use('/api/parse', server.app);
        app.listen(9090, function () {
            console.log('parse-server-example running on port 9090.');
        });
    });
}
setup();
