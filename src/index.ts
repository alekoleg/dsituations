import express, {Request, Response, Application} from 'express';
import * as Parse from 'parse/node';
import * as dotenv from 'dotenv';
import * as i18n from 'i18n';

var ParseServer = require('parse-server').ParseServer;

// Supported languages configuration
const SUPPORTED_LANGUAGES = ['en', 'ru'];
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Middleware to handle language from Parse SDK calls
const handleLanguage = (req: Request, res: Response, next: Function) => {
    // Check if language is provided in the request
    const language = (req.headers['x-parse-language'] as string) || (req.query.language as string);
    if (language && SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
        i18n.setLocale(language);
    }
    next();
};

async function setup()  {

    dotenv.config();
    const app = express();
    const MONGO_DB = process.env.MONGO_DB;
    const MONGO_USERNAME = process.env.MONGO_USERNAME;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

    // test
    const DB_HOST = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@dbaas-db-3578739-4bb2362b.mongo.ondigitalocean.com/${MONGO_DB}?tls=true&authSource=admin&replicaSet=dbaas-db-3578739`
    const SERVER_URL = process.env.SERVER_URL;

    // Specify the connection string for your mongodb database
    // and the location to your Parse cloud code
    const server = new ParseServer({
    databaseURI: DB_HOST,
    javaScriptKey : process.env.JAVASCRIPT_KEY,
    cloud: __dirname + '/cloud.js', // Provide an absolute path
    appId: process.env.APP_ID,
    masterKey: process.env.MASTER_KEY, // Keep this key secret!
    fileKey: null,
    serverURL: SERVER_URL, // Don't forget to change to https if needed
    publicServerURL: SERVER_URL,
    // Your apps name. This will appear in the subject and body of the emails that are sent.
    appName: 'Dialogs.app',
    expireInactiveSessions: false,
    sessionLength: 10 * 360 * 86400// 10 years
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
        locales: SUPPORTED_LANGUAGES,
        directory: __dirname + '/../locales',
        defaultLocale: 'en',
        updateFiles: false,
        syncFiles: false
    });
    await server.start();

    // Serve the Parse API on the /parse URL prefix
    app.use(i18n.init);
    app.use(handleLanguage);  // Add language handling middleware
    app.use('/static', express.static(__dirname + '/public/'));
    app.use('/api/parse', server.app);

    app.listen(9090, function() {
        console.log('parse-server-example running on port 9090.');
    });

}

setup();