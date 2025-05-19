import express, {Request, Response, Application} from 'express';
import * as i18n from 'i18n';

// Supported languages configuration
export const SUPPORTED_LANGUAGES = ['en', 'ru'];

// Middleware to handle language from Parse SDK calls
export const setupCorrectLocale = (req: any) => {

    var language = "en";    
    if (req && req.headers != undefined && req.headers['x-parse-language'] != undefined) {
        language = req.headers['x-parse-language'] as string;
    } else if (req && req.query != undefined && req.query.language != undefined) {
        language = req.query.language as string;
    } else if (req && req.params != undefined && req.params.language != undefined) {
        language = req.params.language as string;
    }

    if (SUPPORTED_LANGUAGES.includes(language)) {
        // Set the locale for both instances
        i18n.setLocale(language);
} else {
        i18n.setLocale("en");
    }
    // какой-то конченый пипец, но только так я смог эту херь завести
    req.__ = function(key: string) {
        return i18n.__(key);
    }
};