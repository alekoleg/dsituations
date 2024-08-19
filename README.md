# Dialong Situations


## API Generic

### Requests defaults
platform: [IOS | Android]
version: [1.0.1]
user_language: ru - 2 symbols
user_id: "some random string"- optional
device_id: "UDID" - generate on device


## Main screen

### **Get Recommended** 

`/feedGetRecommended` 

Request params:  
* defaults

Response: 
```
[
    {
        "title" : "Recommendations"
        "items" : [{
            "item_id" : "id"
            "title": "Shopping" 
            "subtitle" : "Buying iPhone" - опиционально
            "premium" - true | false
            "image_link" : link
            "actions_link" : dsituations://dialog?id=example | dsituations://theme?id=example2
        }]
    }
]

```

### ***Get Situations***

`/feedGetSituations`

Request params:
* defaults

Response: 
```
[
    {
        "title" : "Situations"
        "items" : [{
            "item_id" : "id"
            "title": "Shopping" 
            "subtitle" : "Buying iPhone" - опиционально
            "total" : 12 -> 12 Диалогов
            "premium" - true | false
            "image_link" : link
            "actions_link" : dsituations://dialog?id=example | dsituations://theme?id=example2
        }]
    }
]

```

## Theme screens

### ***GET Theme Details***

`/themeGetDetails`
Request params:
* defaults
theme_id - ид темы


Response:
```
{
    "id" : "ID"
    "image_link" : link
    "title" : "Restaurant"
    "subtitle: "All kind of dialog you may experience in restaurant"
    "vocabulary" : [{ -- все смержиные слова из всех подтем
        "id": "" - не знаю нужно ли
        "text" : "Restaurant"
        "translation" : "Ресторан"
    },
    {
        "id": "" - не знаю нужно ли
        "text" : "Menu"
        "translation" : "Меню"
    }] 
    "themes" : [{
        "id" : "id"
        "title": "Ordering burger" 
        "tags" : [Food, Buying],
        "level" : Intermediate | Begginer | A1 - текст
        "subtitle" : "Buying iPhone" - опиционально
        "premium" - true | false
        "image_link" : link
    }]
}
```

## Dialog screens

### ***GET Dialog Details***

`/gialogGetDetails`
Request params:
* defaults
dialog_id - ид темы

Response:
```
{
    "id" : "ID"
    "image_link" : link
    "title" : "Restaurant"
    "subtitle: "All kind of dialog you may experience in restaurant" 
    "tags" : [Food, Buying],
    "level" : Intermediate | Begginer | A1 - текст
    "premium" - true | false
    "vocabulary" : [{
        "id": "" - не знаю нужно ли
        "text" : "Restaurant"
        "translation" : "Ресторан"
    },
    {
        "id": "" - не знаю нужно ли
        "text" : "Menu"
        "translation" : "Меню"
    }]
    "dialog" : [
    {
        "id" : "id"
        "name" : "John Wick"
        "text": "Good evening! Welcome to our restaurant. Can I offer you a menu?" - Формат html и кликали по лексемам TBD
        "audio_link" : "Link на файл .m3u8" - его нужно просто скорпить в плеер и будет аудио. 
        "image_link" : link
    },
    { 
        "id" : "id"
        "name" : "Vasya Pupkin"
        "text": "Sounds delicious! I think I'll take the filet mignon. What about desserts?" - Формат html и кликали по лексемам TBD
        "audio_link" : "Link на файл .m3u8" - его нужно просто скорпить в плеер и будет аудио. 
        "image_link" : link
    }
    ]
}
```



