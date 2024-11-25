const fs = require('fs');
const Parse = require('parse/node');
const path = require('path');
const os = require('os');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
// const jsKey = process.env.YOUR_JAVASCRIPT_KEY;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;
const elevenlablsKey = process.env.ELEVENTLABS_API_KEY;

console.log('appId:', appId);

if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId);
Parse.serverURL = serverURL;
Parse.masterKey = masterKey;

const elevenlabsSpeacker1 = 'onwK4e9ZLuTAKqWW03F9';
const elevenlabsSpeacker2 = '9F4C8ztpNUmXkdDDbz3J';
const elevenlabsUrl = 'https://api.elevenlabs.io/v1/text-to-speech/';

async function start() {
    const Speech = Parse.Object.extend('Speech');
    const query = new Parse.Query(Speech);
    // query.limit(2);
    const results = await query.find();
    console.log('Successfully retrieved', results.length, 'objects.');

    for (let i = 0; i < results.length; i++) {
        const object = results[i];
        const speaker = object.get('speaker');
        await speaker.fetch();
        console.log('speaker:', speaker);
        const speakerName  = speaker.get('name');
        let voiceId = elevenlabsSpeacker1;
        console.log('speakerName:', speakerName);
        if (speakerName === 'Oleg') {
            voiceId = elevenlabsSpeacker2;
        } 
        console.log(object.id + ' - ' + object.get('text'));
        await generateElevenLabsAudio(object.get('text'), object.id, voiceId);
        console.log('-------------------------------------');
    }
}

async function generateElevenLabsAudio(text, filename, voice_id) {
    console.log('generateElevenLabsAudio text:', text);

    const directory = path.join(os.tmpdir(), `d_situations`);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    const output = path.join(directory, `${filename}.mp3`);

    try {
        await synthesizeWithTimestamps(text, output, voice_id);
        console.log(`Audio content written to file: ${output}`);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function synthesize(text, path, voice_id) {
    const headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlablsKey,
    };

    const url = elevenlabsUrl + voice_id;
    const data = {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
        },
    };

    await axios.post(url, data, { headers: headers, responseType: "stream" }).then(function (response) {
        response.data.pipe(fs.createWriteStream(path));
    })
}

async function synthesizeWithTimestamps(text, filePath, voice_id) {
    const headers = {
        'Content-Type': 'application/json',
        'xi-api-key': elevenlablsKey,
    };

    const url = `${elevenlabsUrl}${voice_id}/with-timestamps`;
    const data = {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
        },
    };

    try {
        const response = await axios.post(url, data, { headers });
        
        if (response.status !== 200) {
            throw new Error(`Ошибка API: ${response.status} - ${response.statusText}`);
        }

        // Извлекаем аудио и метки времени из ответа
        const audioBuffer = Buffer.from(response.data.audio_base64, 'base64');
        const timestamps = response.data.alignment;

        // Сохраняем аудио файл
        fs.writeFileSync(filePath, audioBuffer);
        
        // Сохраняем метки времени в JSON файл
        const timestampPath = filePath.replace('.mp3', '_timestamps.json');
        fs.writeFileSync(timestampPath, JSON.stringify(timestamps, null, 2));

        console.log(`Аудио файл сохранен: ${filePath}`);
        console.log(`Метки времени сохранены: ${timestampPath}`);
        
        return timestamps;
    } catch (error) {
        console.error('Ошибка при генерации аудио:', error.message);
        throw error;
    }
}



start()