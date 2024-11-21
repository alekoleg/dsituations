const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Конфигурация DigitalOcean Spaces
const s3 = new S3Client({
    endpoint: 'https://fra1.digitaloceanspaces.com', // Замените на ваш регион
    region: 'fra1', // Замените на регион DigitalOcean Spaces
    credentials: {
        accessKeyId: process.env.DIGITAL_SPACE_ACCESS_KEY_ID, // Используйте свои ключи
        secretAccessKey: process.env.DIGITAL_SPACE_SECRET_ACCESS_KEY
    }
});

// Создание общей временной директории для скачивания файлов
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mp3-download-'));

// Функция для скачивания файла в локальную временную директорию
async function downloadFileToTempDir(bucketName, fullPath) {
    const tempFilePath = path.join(tempDir, path.basename(fullPath));
    const getObjectParams = {
        Bucket: bucketName,
        Key: fullPath
    };

    const dataStream = await s3.send(new GetObjectCommand(getObjectParams));
    const writeStream = fs.createWriteStream(tempFilePath);
    dataStream.Body.pipe(writeStream);

    writeStream.on('finish', () => {
        console.log(`Файл ${fullPath} скачан в временную директорию: ${tempFilePath}`);
        processDownloadedFile(tempFilePath, bucketName, fullPath);
    });
}

// Функция для обработки скаченного файла
function processDownloadedFile(tempFilePath, bucketName, fullPath) {
    const outputDir = path.join(path.dirname(tempFilePath), path.basename(fullPath, '.mp3') + '_segments');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    
    const outputPattern = path.join(outputDir, 'fileSequence%d.mp3');
    const m3u8FilePath = path.join(outputDir, 'prog_index.m3u8');
    
    const command = `ffmpeg -i ${tempFilePath} -f segment -segment_time 9 -segment_list ${m3u8FilePath} -segment_format mp3 ${outputPattern}`;
    
    exec(command, async (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка при обработке файла ${tempFilePath}:`, error);
            return;
        }
        console.log(`Файл ${tempFilePath} успешно обработан командой ffmpeg.`);
        
        // Загрузка результатов обратно в хранилище
        const files = fs.readdirSync(outputDir);
        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const uploadKey = path.join(path.dirname(fullPath), path.basename(fullPath, '.mp3') + '_stream', file);
            
            const fileStream = fs.createReadStream(filePath);
            const uploadParams = {
                Bucket: bucketName,
                Key: uploadKey,
                Body: fileStream,
                ACL: "public-read",
            };
            
            try {
                await s3.send(new PutObjectCommand(uploadParams));
                console.log(`Файл ${file} загружен обратно в хранилище как ${uploadKey}`);
            } catch (uploadError) {
                console.error(`Ошибка при загрузке файла ${file} в хранилище:`, uploadError);
            }
        }
    });
}

// Функция для проверки файлов в хранилище
async function checkDirectories(bucketName, folderPath) {
    try {
        const params = {
            Bucket: bucketName,
            Prefix: folderPath.endsWith('/') ? folderPath : folderPath + '/'
        };

        // Получение списка объектов (файлов и папок) в хранилище
        const data = await s3.send(new ListObjectsV2Command(params));

        for (const item of data.Contents) {
            const fullPath = item.Key;

            if (fullPath.includes('_stream')) {
                console.log(`Файл ${fullPath} пропущен, так как он уже содержит _stream в пути.`);
                continue;
            }

            if (fullPath.endsWith('.mp3')) {
                // Проверяем наличие папки _stream рядом с MP3 файлом
                const streamFolder = path.join(path.dirname(fullPath), path.basename(fullPath, '.mp3') + '_stream');

                const streamParams = {
                    Bucket: bucketName,
                    Prefix: streamFolder
                };

                const streamData = await s3.send(new ListObjectsV2Command(streamParams));

                if (!streamData.Contents || streamData.Contents.length === 0) {
                    console.log(`MP3 файл найден: ${fullPath}`);
                    console.log(`Папка _stream отсутствует в директории: ${path.dirname(fullPath)}`);

                    // Скачивание MP3 файла в локальную временную директорию
                    await downloadFileToTempDir(bucketName, fullPath);
                } else {
                    console.log(`MP3 файл найден: ${fullPath}`);
                    console.log(`Папка _stream существует в директории: ${path.dirname(fullPath)}`);
                }
            }
        }
    } catch (error) {
        console.error(`Ошибка при обработке директории: ${folderPath}`, error);
    }
}

// Пример использования
const bucketName = process.argv[2]; // Название бакета передаётся первым аргументом
const folderPath = process.argv[3]; // Путь к папке передаётся вторым аргументом

if (!bucketName || !folderPath) {
    console.error('Пожалуйста, укажите название бакета и путь к директории.');
    process.exit(1);
}

checkDirectories(bucketName, folderPath);
