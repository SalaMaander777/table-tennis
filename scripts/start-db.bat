@echo off
rem Запуск локального PostgreSQL (порт 5432, БД tennis). Остановка: Ctrl+C
cd /d "%~dp0.."
mvn -B -q test-compile exec:java
