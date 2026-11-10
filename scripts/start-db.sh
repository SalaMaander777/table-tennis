#!/usr/bin/env sh
# Запуск локального PostgreSQL (порт 5432, БД tennis). Остановка: Ctrl+C
cd "$(dirname "$0")/.." && exec mvn -B -q test-compile exec:java
