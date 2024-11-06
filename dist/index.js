"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
const i18n = __importStar(require("i18n"));
var ParseServer = require('parse-server').ParseServer;
function setup() {
    return __awaiter(this, void 0, void 0, function* () {
        dotenv.config();
        const app = (0, express_1.default)();
        const MONGO_DB = process.env.MONGO_DB;
        const MONGO_USERNAME = process.env.MONGO_USERNAME;
        const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
        // test
        const DB_HOST = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@dbaas-db-3578739-4bb2362b.mongo.ondigitalocean.com/${MONGO_DB}?tls=true&authSource=admin&replicaSet=dbaas-db-3578739`;
        const SERVER_URL = process.env.SERVER_URL;
        // Specify the connection string for your mongodb database
        // and the location to your Parse cloud code
        const server = new ParseServer({
            databaseURI: DB_HOST,
            javaScriptKey: process.env.JAVASCRIPT_KEY,
            cloud: __dirname + '/cloud.js', // Provide an absolute path
            appId: process.env.APP_ID,
            masterKey: process.env.MASTER_KEY, // Keep this key secret!
            fileKey: null,
            serverURL: SERVER_URL, // Don't forget to change to https if needed
            publicServerURL: SERVER_URL,
            // Your apps name. This will appear in the subject and body of the emails that are sent.
            appName: 'Dialogs.app',
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
        i18n.configure({
            locales: ['en'],
            directory: __dirname + '/../locales',
            defaultLocale: 'en'
        });
        yield server.start();
        // Serve the Parse API on the /parse URL prefix
        app.use(i18n.init);
        app.use('/static', express_1.default.static(__dirname + '/public/'));
        app.use('/api/parse', server.app);
        app.listen(9090, function () {
            console.log('parse-server-example running on port 9090.');
        });
    });
}
setup();
