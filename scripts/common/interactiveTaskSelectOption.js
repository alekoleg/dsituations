const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Инициализация клиента OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Массивы возможных значений для параметров
const topicValue = [
    "Comprehension Questions (Understanding the Dialog)",
    "Vocabulary & Phrase Meaning Questions",
    "Inference Questions (Reading Between the Lines)",
    "Detail-Oriented Questions (Checking Specific Information)",
];

const orderValue = [
    3,
    4,
    5,
];

function getSystemPrompt(topic) {
    const SystemPrompt = `You are a professional API Service that generates ONE question for dialogs. 

Question Requirements
Topic: ${topic}

Questions
	•	Each question should include several answer options, with one correct option and several incorrect ones.
	•	Shuffle the order of correct and incorrect answers.
	•	There must be only one correct option.
	•	The questions must be short, and the answersmust be less 3 words.

Output Format
ONLY REPLY IN JSON. NO PROSE.  No AI introduction, no AI analysis, return generated data only, not human-readable,
Allways must provide sample questions in the following JSON format:


  {
    "id": "[unique identifier]",
    "level": "[a1|b1]",
    "order": "[position of the message in the dialogue]",
    "data": {
      "question": "[question]",
      "answers": [
        {
          "id": "[answer identifier]",
          "text": "[answer]",
          "is_correct": [true/false]
        }
        ...
      ]
    }
  }


Example


  {
    "id": "saldjaslk",
    "level": "a1",
    "order": 1 | number (order),
    "data": {
      "question": "question",
      "answers": [
        {
          "id": "1",
          "text": "answers 1",
          "is_correct": true
        },
        {
          "id": "2",
          "text": "answers 2",
          "is_correct": false
        },
        {
          "id": "3",
          "text": "answers 3",
          "is_correct": false
        }
      ]
    }
  }
`;
    return SystemPrompt;
}

// Функция для валидации JSON
function isValidJSON(text) {
    try {
        JSON.parse(text);
        return true;
    } catch (e) {
        return false;
    }
}

// Функция для извлечения JSON из текста
function extractJSON(text) {
    // Ищем JSON между фигурными скобками
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            const jsonText = jsonMatch[0];
            // Проверяем, является ли это валидным JSON
            const parsed = JSON.parse(jsonText);
            return jsonText;
        } catch (e) {
            // Если не удалось распарсить JSON, возвращаем null
            return null;
        }
    }
    return null;
}

/**
 * Обрабатывает входящий текст и возвращает JSON-результат
 * @param {string} inputText - Входящий текст для обработки
 * @returns {Promise<Object>} - Результат в формате JSON
 */
async function processText(inputText) {
    try {
        // Создаем системный промпт с подстановкой случайных параметров
        const question1Topic = topicValue[Math.floor(Math.random() * topicValue.length)];
        // random from paramValues2
        const question1Order = orderValue[Math.floor(Math.random() * orderValue.length)];
        const question2Topic = topicValue[Math.floor(Math.random() * topicValue.length)];
        let systemPrompt = getSystemPrompt(question1Topic);
        console.log(`Используемые параметры: ${systemPrompt}`);
        // get first question1Order lines from inputText
        let textForQuestion1 = inputText.split('\n').slice(0, question1Order).join('\n');

        let question1 = await generateResponseForOpenAI(textForQuestion1, systemPrompt);
        question1.order = question1Order;

        let systemPrompt2 = getSystemPrompt(question2Topic);
        console.log(`Используемые параметры: ${systemPrompt2}`);
        let textForQuestion2 = inputText
        let question2 = await generateResponseForOpenAI(textForQuestion2, systemPrompt2);
        question2.order = inputText.split('\n').length;

        // merge array question1 and question2 in one array
        let result = [question1, question2];

        console.log(`Результат: ${result}`);
        return result;
    } catch (error) {
        console.error("Ошибка при обработке текста:", error);
        return {
            error: true,
            message: error.message || "Произошла ошибка при обработке текста"
        };
    }
}

async function generateResponseForOpenAI(inputText, systemPrompt) {
    // Создаем чат с OpenAI
    const response = await openai.chat.completions.create({
        // model: "gpt-4o", // или любая другая подходящая модель
        // model: "o3-mini-2025-01-31", // или любая другая подходящая модель
        model: "gpt-4o", // или любая другая подходящая модель
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: inputText }
        ],
        temperature: 0.7
    });

    // Получаем ответ
    const responseContent = response.choices[0].message.content;

    console.log(`Ответ: ${responseContent}`);

    // Проверяем, является ли ответ валидным JSON
    if (isValidJSON(responseContent)) {
        return JSON.parse(responseContent);
    } else {
        // Пытаемся извлечь JSON из текста
        const extractedJSON = extractJSON(responseContent);
        if (extractedJSON && isValidJSON(extractedJSON)) {
            return JSON.parse(extractedJSON);
        } else {
            // Если не удалось получить валидный JSON, возвращаем ошибку
            throw new Error("Не удалось получить валидный JSON от API");
        }
    }
}

// Пример использования функции
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log("Пожалуйста, укажите текст для обработки.");
        process.exit(1);
    }

    const inputText = args.join(" ");

    try {
        console.log("Обработка текста...");
        const result = await processText(inputText);
        console.log("Результат:");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Критическая ошибка:", error);
        process.exit(1);
    }
}

// Запускаем скрипт, если он вызван напрямую
if (require.main === module) {
    main();
}

// Экспортируем функцию для использования в других скриптах
module.exports = { generateInteractiveSelectOption: processText };
