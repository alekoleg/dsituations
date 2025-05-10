const fs = require('fs');
const Parse = require('parse/node');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация Parse SDK с использованием переменных среды
const appId = process.env.APP_ID;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;

console.log('appId:', appId);

if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId);
Parse.serverURL = serverURL;
Parse.masterKey = masterKey;

// Функция для проверки существования файла на DigitalOcean Spaces
async function checkFileExists(url) {
    try {
        const response = await axios.head(url);
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

async function checkDialogSpeeches() {
    try {
        console.log('Начинаем проверку не скрытых диалогов...');
        
        // Массив для записи отсутствующих аудиофайлов
        const missingAudioFiles = [];
        let totalDialogs = 0;
        let totalSpeeches = 0;
        let totalMissing = 0;
        
        // Получаем не скрытые диалоги с пагинацией
        let dialogSkip = 0;
        const dialogLimit = 100;
        let hasMoreDialogs = true;
        
        while (hasMoreDialogs) {
            const Dialog = Parse.Object.extend('Dialog');
            const dialogQuery = new Parse.Query(Dialog);
            dialogQuery.notEqualTo('hidden', true);
            dialogQuery.skip(dialogSkip);
            dialogQuery.limit(dialogLimit);
            
            const dialogs = await dialogQuery.find({ useMasterKey: true });
            
            if (dialogs.length === 0) {
                hasMoreDialogs = false;
                break;
            }
            
            totalDialogs += dialogs.length;
            console.log(`Получено ${dialogs.length} диалогов (смещение: ${dialogSkip})`);
            
            // Обрабатываем каждый диалог
            for (const dialog of dialogs) {
                console.log(`\nПроверка диалога: ${dialog.id} - ${dialog.get('title') || 'Без названия'}`);
                
                // Проверяем все уровни сложности
                const levels = ['a1', 'b1', 'c1'];
                
                for (const level of levels) {
                    const relationKey = `dialog_${level}`;
                    if (!dialog.relation(relationKey)) {
                        continue;
                    }
                    
                    // Получаем все реплики для текущего уровня с пагинацией
                    let speechSkip = 0;
                    const speechLimit = 500;
                    let hasMoreSpeeches = true;
                    
                    while (hasMoreSpeeches) {
                        const speechesQuery = dialog.relation(relationKey).query();
                        speechesQuery.skip(speechSkip);
                        speechesQuery.limit(speechLimit);
                        
                        const speeches = await speechesQuery.find({ useMasterKey: true });
                        
                        if (speeches.length === 0) {
                            hasMoreSpeeches = false;
                            break;
                        }
                        
                        totalSpeeches += speeches.length;
                        console.log(`Уровень ${level.toUpperCase()}: найдено ${speeches.length} реплик (смещение: ${speechSkip})`);
                        
                        // Проверяем каждую реплику
                        for (const speech of speeches) {
                            const speechId = speech.id;
                            const text = speech.get('text');
                            
                            if (!text) continue; // Пропускаем, если нет текста
                            
                            // Формируем URL-адреса для аудиофайла и файла временных меток
                            const audioUrl = `https://dialogs.fra1.digitaloceanspaces.com/speeches/${speechId}.mp3`;
                            const timestampUrl = `https://dialogs.fra1.digitaloceanspaces.com/speeches/${speechId}_timestamps.json`;
                            
                            // Проверяем наличие аудиофайла и файла временных меток
                            const audioExists = await checkFileExists(audioUrl);
                            const timestampExists = await checkFileExists(timestampUrl);
                            
                            // Если файл отсутствует, добавляем информацию в список
                            if (!audioExists || !timestampExists) {
                                totalMissing++;
                                missingAudioFiles.push({
                                    dialogId: dialog.id,
                                    dialogTitle: dialog.get('title') || 'Без названия',
                                    level: level,
                                    speechId: speechId,
                                    text: text,
                                    audioExists: audioExists,
                                    timestampExists: timestampExists,
                                    audioUrl: audioUrl,
                                    timestampUrl: timestampUrl
                                });
                                
                                if (totalMissing % 10 === 0) {
                                    console.log(`Найдено ${totalMissing} отсутствующих аудиофайлов`);
                                }
                            }
                        }
                        
                        // Увеличиваем смещение для следующего запроса реплик
                        speechSkip += speeches.length;
                    }
                }
            }
            
            // Увеличиваем смещение для следующего запроса диалогов
            dialogSkip += dialogs.length;
            
            // Каждые 500 диалогов сохраняем промежуточные результаты
            if (totalDialogs % 500 === 0 || totalDialogs >= 500) {
                const tempOutputFile = path.resolve(__dirname, `../../missing_audio_files_temp_${totalDialogs}.json`);
                fs.writeFileSync(tempOutputFile, JSON.stringify(missingAudioFiles, null, 2));
                console.log(`Промежуточные результаты сохранены в файл: ${tempOutputFile}`);
            }
        }
        
        // Сохраняем окончательные результаты в файл
        const outputFile = path.resolve(__dirname, '../../missing_audio_files.json');
        fs.writeFileSync(outputFile, JSON.stringify(missingAudioFiles, null, 2));
        
        console.log(`\nПроверка завершена.`);
        console.log(`Всего проверено:`);
        console.log(`- Диалогов: ${totalDialogs}`);
        console.log(`- Реплик: ${totalSpeeches}`);
        console.log(`Найдено ${missingAudioFiles.length} отсутствующих аудиофайлов.`);
        console.log(`Результаты сохранены в файл: ${outputFile}`);
        
    } catch (error) {
        console.error('Ошибка при проверке диалогов:', error);
    }
}

// Запускаем проверку
checkDialogSpeeches();
