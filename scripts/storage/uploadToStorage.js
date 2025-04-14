const { S3 } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function uploadToDigitalOcean(sourceFolder, destinationFolder) {
    // Конфигурация клиента S3 для DigitalOcean Spaces
    const s3Client = new S3({
        endpoint: process.env.DO_SPACES_ENDPOINT,
        region: process.env.DO_SPACES_REGION,
        credentials: {
            accessKeyId: process.env.DO_SPACES_KEY,
            secretAccessKey: process.env.DO_SPACES_SECRET
        }
    });

    try {
        // Чтение всех файлов из исходной папки
        const files = fs.readdirSync(sourceFolder);

        for (const file of files) {
            const filePath = path.join(sourceFolder, file);
            const fileStream = fs.createReadStream(filePath);
            
            // Определение пути назначения в DigitalOcean Spaces
            const key = path.join(destinationFolder, file);

            // Загрузка файла
            await s3Client.putObject({
                Bucket: process.env.DO_SPACES_BUCKET,
                Key: key,
                Body: fileStream,
                ACL: 'public-read'
            });

            console.log(`Файл ${file} успешно загружен в ${key}`);
        }

        console.log('Все файлы успешно загружены');
    } catch (error) {
        console.error('Ошибка при загрузке файлов:', error);
        throw error;
    }
}

// Если файл запускается напрямую через командную строку
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.error('Необходимо указать два параметра:');
        console.error('1. Путь к исходной папке');
        console.error('2. Путь к папке назначения в DigitalOcean Spaces');
        console.error('\nПример использования:');
        console.error('node scripts/storage/updateToStorage.js ./source-folder destination-folder');
        process.exit(1);
    }

    const [sourceFolder, destinationFolder] = args;
    
    // Проверка существования исходной папки
    if (!fs.existsSync(sourceFolder)) {
        console.error(`Ошибка: Папка ${sourceFolder} не существует`);
        process.exit(1);
    }

    uploadToDigitalOcean(sourceFolder, destinationFolder)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Ошибка при выполнении скрипта:', error);
            process.exit(1);
        });
}

module.exports = uploadToDigitalOcean;
