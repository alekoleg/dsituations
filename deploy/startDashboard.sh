#!/bin/bash

# Проверка наличия файла .env
if [ ! -f .env ]; then
  echo "Файл .env не найден!"
  exit 1
fi

# Чтение переменных из файла .env с учётом пробелов вокруг '='
while IFS='=' read -r key value; do
  # Пропуск комментариев и пустых строк
  if [[ -n "$key" && ! "$key" =~ ^# ]]; then
    # Удаление пробелов вокруг ключа и значения
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    export "$key"="$value"
  fi
done < .env

# Проверка наличия необходимых переменных
if [ -z "$APP_ID" ] || [ -z "$MASTER_KEY" ] || [ -z "$SERVER_URL" ]; then
  echo "Необходимые переменные не найдены в .env файле!"
  exit 1
fi

# Запуск команды parse-dashboard с использованием переменных из .env
parse-dashboard --dev --appId "$APP_ID" --masterKey "$MASTER_KEY" --serverURL "$SERVER_URL" --appName Situation