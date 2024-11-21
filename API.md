# API Документация

## Эндпоинт: `AppState`
пока не описан

## Эндпоинт: `topicsAll`

### Описание
Возвращает список тем (topics) с пагинацией, включая связанные с ними ситуации (situations). Темы сортируются по полю `order` по возрастанию.

### Параметры запроса
| Параметр | Тип    | Обязательный | Описание                                    |
|----------|--------|--------------|---------------------------------------------|
| offset   | number | Нет          | Смещение для пагинации (по умолчанию: 0)   |

### Размер страницы
- Фиксированный размер страницы: 20 элементов

### Формат ответа
{
    items: Array<{
        id: string;
        image: {
            type: "URL";
            url: string;
        };
        name: string;
        situations_previews: Array<{
            id: string;
            image: {
                type: "URL";
                url: string;
            };
            name: string;
            number_of_dialogs: number;
        }>;
    }>;
    offset: number; // Следующее смещение для пагинации
}


### Пример ответа
```
{
    "items": [
        {
            "id": "topic123",
            "image": {
                "type": "URL",
                "url": "https://example.com/image.jpg"
            },
            "name": "Название темы",
            "situations_previews": [
                {
                    "id": "situation456",
                    "image": {
                        "type": "URL",
                        "url": "https://example.com/situation-image.jpg"
                    },
                    "name": "Название ситуации",
                    "number_of_dialogs": 5
                },
                {
                    "id": "situation789",
                    "image": {
                        "type": "URL",
                        "url": "https://example.com/situation-image-2.jpg"
                    },
                    "name": "Другая ситуация",
                    "number_of_dialogs": 3
                }
            ]
        },
        {
            "id": "topic456",
            "image": {
                "type": "URL",
                "url": "https://example.com/image-2.jpg"
            },
            "name": "Другая тема",
            "situations_previews": [
                {
                    "id": "situation101",
                    "image": {
                        "type": "URL",
                        "url": "https://example.com/situation-image-3.jpg"
                    },
                    "name": "Третья ситуация",
                    "number_of_dialogs": 2
                }
            ]
        }
    ],
    "offset": 20
}
```

### Примечания
- Если для темы или ситуации не указана ссылка на изображение (`image_link`), будет использовано изображение по умолчанию: `https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg`
- Для каждой темы загружаются все связанные ситуации через relation 'situations'
- `number_of_dialogs` показывает количество диалогов в ситуации (по умолчанию: 0)
- Ответ включает смещение для следующей страницы (`offset + topics.length`)


## Эндпоинт: `topicById`

### Описание
Возвращает информацию о конкретной теме (topic) по её идентификатору, включая связанные с ней ситуации (situations).

### Параметры запроса
| Параметр | Тип    | Обязательный | Описание                    |
|----------|--------|--------------|----------------------------|
| id       | string | Да           | Идентификатор темы         |

### Формат ответа
{
    id: string;
    image: {
        type: "URL";
        url: string;
    };
    name: string;
    situations_previews: Array<{
        id: string;
        image: {
            type: "URL";
            url: string;
        };
        name: string;
        number_of_dialogs: number;
    }>;
}

### Пример ответа
```json
{
    "id": "topic123",
    "image": {
        "type": "URL",
        "url": "https://example.com/image.jpg"
    },
    "name": "Название темы",
    "situations_previews": [
        {
            "id": "situation456",
            "image": {
                "type": "URL",
                "url": "https://example.com/situation-image.jpg"
            },
            "name": "Название ситуации",
            "number_of_dialogs": 5
        }
    ]
}
```

### Примечания
- Если для темы или ситуации не указана ссылка на изображение (`image_link`), будет использовано изображение по умолчанию: `https://i.pinimg.com/originals/5b/6e/ca/5b6eca63605bea0eeb48db43f77fa0ce.jpg`
- Для темы загружаются все связанные ситуации через relation 'situations'
- `number_of_dialogs` показывает количество диалогов в ситуации (по умолчанию: 0)
- При отсутствии темы с указанным идентификатором будет возвращена ошибка