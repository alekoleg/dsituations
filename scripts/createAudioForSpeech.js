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

// david
// const elevenlabsSpeacker1 = 'onwK4e9ZLuTAKqWW03F9';
// Liam
const elevenlabsSpeacker1 = 'TX3LPaxmHKxFdv7VOQHJ';

const elevenlabsSpeacker2Female = 'cgSgspJ2msm6clMCkdW9';
const elevenlabsSpeacker2Male = 'iP95p4xoKVk53GoZ742B';
const elevenlabsUrl = 'https://api.elevenlabs.io/v1/text-to-speech/';

const AudioVersionId = 'v09052025.1';

async function startWithDialogs() {

    // find not hidden dialogs
    console.log('start');
    const Dialog = Parse.Object.extend('Dialog');
    const queryDialog = new Parse.Query(Dialog);
    queryDialog.notEqualTo('hidden', true);
    queryDialog.limit(1000);
    const dialogs = await queryDialog.find();
    
    console.log('Found', dialogs.length, 'not hidden dialogs');

    var characterCounter = 0;

    // get speeches relation from dialogs
    for (let i = 0; i < dialogs.length; i++) {
        const dialog = dialogs[i];
        const speechesQuery = dialog.relation('dialog_c1').query();
        speechesQuery.notEqualTo("audio_version", AudioVersionId);
        const results = await speechesQuery.find();
        console.log('Found', results.length, 'speeches for dialog', dialog.id);


        for (let i = 0; i < results.length; i++) {
            const object = results[i];
            // log object
            console.log('object:', object.id);
            const speaker = object.get('speaker');
            if (speaker.id === "TK8lho9yAI") {
                console.log('speaker not found');
                console.log('-------------------------------------');
                continue;
            }
            await speaker.fetch();
            console.log('speaker:', speaker);

            let voiceId;
            const sex = speaker.get('sex');
            console.log('sex:', sex);
            // main character
            if (speaker.id === '2B2zENPfFH') {
                voiceId = elevenlabsSpeacker1;
            } else if (sex === 'female') {
                voiceId = elevenlabsSpeacker2Female;
            } else if (object.get('sex') === 'male') {
                voiceId = elevenlabsSpeacker2Male;
            }

            // characterCounter += object.get('text').length;

            console.log(object.id + ' - ' + object.get('text'));
            await generateElevenLabsAudio(object.get('text'), object.id, voiceId);
            console.log('-------------------------------------');
            object.set('audio_version', AudioVersionId);
            await object.save();
        }
    }

    console.log('characterCounter:', characterCounter);
}

function startWithSpeeches() {
    console.log('Starting with speeches from missing_audio_files.json');
    
    // Read the missing_audio_files.json file
    const missingAudioData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../missing_audio_files.json'), 'utf8'));
    console.log(`Found ${missingAudioData.length} speeches missing audio files`);
    
    // Process each speech
    processSpeechBatch(missingAudioData, 0);
}

async function processSpeechBatch(speeches, startIndex, batchSize = 5) {
    if (startIndex >= speeches.length) {
        console.log('All speeches processed successfully!');
        return;
    }
    
    const endIndex = Math.min(startIndex + batchSize, speeches.length);
    console.log(`Processing speeches ${startIndex + 1} to ${endIndex} of ${speeches.length}`);
    
    const Speech = Parse.Object.extend('Speech');
    
    for (let i = startIndex; i < endIndex; i++) {
        const speechData = speeches[i];
        console.log(`Processing speech ${i + 1}/${speeches.length}: ${speechData.speechId} - "${speechData.text.substring(0, 30)}..."`);
        
        try {
            // Fetch the speech from Parse
            const query = new Parse.Query(Speech);
            query.include('speaker');
            query.equalTo("objectId", speechData.speechId);
            const speech = await query.first();
            
            if (!speech) {
                console.log(`Speech not found: ${speechData.speechId}`);
                continue;
            }
            
            // Get speaker information
            const speaker = speech.get('speaker');
            
            // Determine voice ID based on speaker
            let voiceId;
            const sex = speaker.get('sex');
            
            // Main character
            if (speaker.id === '2B2zENPfFH') {
                voiceId = elevenlabsSpeacker1;
            } else if (sex === 'female') {
                voiceId = elevenlabsSpeacker2Female;
            } else {
                voiceId = elevenlabsSpeacker2Male;
            }
            
            // Generate audio
            await generateElevenLabsAudio(speech.get('text'), speech.id, voiceId);
            
            // Update audio version
            speech.set('audio_version', AudioVersionId);
            await speech.save();
            
            console.log(`Successfully processed speech: ${speechData.speechId}`);
        } catch (error) {
            console.error(`Error processing speech ${speechData.speechId}:`, error.message);
        }
    }
    
    // Process next batch
    setTimeout(() => {
        processSpeechBatch(speeches, endIndex, batchSize);
    }, 10000); // Small delay between batches to avoid overwhelming the API
}

async function generateElevenLabsAudio(text, filename, voice_id) {
    console.log('generateElevenLabsAudio text:', text);

    const directory = path.join(os.tmpdir(), `d_situations_2`);
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
        // log request
        console.log('request:', url);
        
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

// Update to call both functions or choose which one to run
startWithSpeeches();
// startWithDialogs();