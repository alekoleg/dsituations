const Parse = require('parse/node');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация Parse SDK
const appId = process.env.APP_ID;
const serverURL = process.env.SERVER_URL;
const masterKey = process.env.MASTER_KEY;

if (!appId || !serverURL) {
    console.error('Не удалось загрузить переменные среды из .env файла.');
    process.exit(1);
}

Parse.initialize(appId);
Parse.serverURL = serverURL;
Parse.masterKey = masterKey;

async function updateSpeakerImages() {
    try {
        console.log('Обновление спикеров...');
        const pageSize = 1000; // Обрабатываем по 100 записей за раз
        let offset = 0;
        let hasMore = true;
        let totalUpdated = 0;

        while (hasMore) {
            const query = new Parse.Query("Speaker");
            query.limit(pageSize);
            query.skip(offset); // Используем пагинацию через offset
            
            const speakers = await query.find();
            console.log(`Обработка ${speakers.length} спикеров (смещение ${offset})`);

            if (speakers.length === 0) {
                hasMore = false;
                break;
            }

            for (const speaker of speakers) {
                const oldImageLink = speaker.get('image_link');
                if (oldImageLink === "https://dialogs.fra1.cdn.digitaloceanspaces.com/images/speaker/mainCharacter.png") {
                    continue;
                }

                const newImageLink = "https://dialogs.fra1.cdn.digitaloceanspaces.com/images/speaker/defaultSpeaker.png";
                if (oldImageLink !== newImageLink) {
                    speaker.set('image_link', newImageLink);
                    await speaker.save(null);
                    totalUpdated++;
                    console.log(`Обновлен image_link для спикера ${speaker.id}`);
                }
            }

            offset += speakers.length;
            if (speakers.length < pageSize) {
                hasMore = false; // Последняя страница
            }
        }

        console.log(`Обновление завершено. Всего обновлено: ${totalUpdated} спикеров`);
    } catch (error) {
        console.error('Ошибка при обновлении спикеров:', error);
    }
}

// Запускаем скрипт
updateSpeakerImages();
