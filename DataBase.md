# Dialog DataBase


## Themes

```
object_id [String] - представляется по умолчанию ParseSDK
title [String] - English 
subtitle [String]
premium [Bool]
image_link [String]
dialogs [Reference]
vocabulary [String] - plain json object?

```

##
Dialogs

```

object_id [String]
image_link [String]
title [String]
subtitle [String]
tags [Array],
level [String]
premium [Bool]
vocabulary [String][Plain JSON] : 
dialog [Reference] 
vocabulary [String][Plain json object]
```

###
Speech [Реплики диалога]
```
object_id[String]
text [String]
speaker [Pointer]
order [int] - Reference это связь в базе данных, но не отсортированная. Поэтому нужно добавить поля для сортировки
```

###
Speaker
```
object_id[String]
name[String]
image_link[String]
```
