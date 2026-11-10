# Теннисное табло — офлайн-комплект для разработки

ТЗ: https://zhukovsd.github.io/java-backend-learning-course/projects/tennis-scoreboard/

Всё необходимое лежит в этом каталоге; интернет не нужен.
**На компьютере должен быть установлен JDK 21** (его и IDE в архив не входят).

## Что внутри
| Путь | Назначение |
|---|---|
| `pom.xml` | Maven, WAR. Spring MVC 6.2, Hibernate 6.6, PostgreSQL JDBC, HikariCP, Jackson, Lombok, MapStruct, JUnit 5, spring-test |
| `m2repo/` | **Офлайн-репозиторий Maven** со всеми зависимостями и плагинами (подключён через `.mvn/maven.config`, режим `-o`) |
| `db/schema.sql` | Схема БД по ТЗ: таблицы `players`, `matches` |
| `src/test/java/dev/DevDatabase.java` | Локальный настоящий PostgreSQL 16 (без установки), порт 5432, БД `tennis` |
| `src/main/webapp/` | Фронтенд (github.com/zhukovsd/tennis-scoreboard-frontend), 4 страницы. jQuery и шрифты Poppins/Roboto Mono вшиты локально — в оригинале они грузились с CDN |
| `tools/` | Tomcat 10.1.61 (zip) и Maven 3.9.16 (zip) |
| `src/test/java/smoke/StackSmokeTest.java` | Проверка, что стек работает; удалите, когда появятся свои тесты |

## Быстрый старт
Все команды выполняйте из корня проекта (там находится `.mvn/`).

1. База данных (оставьте работать в отдельном терминале):
   `scripts/start-db.sh` или `scripts\start-db.bat`
   → `jdbc:postgresql://localhost:5432/tennis`, пользователь `postgres`, пароль любой (trust-авторизация). Данные в `.pgdata/`; чтобы сбросить БД, остановите её и удалите этот каталог.
   Схема применяется автоматически (`db/schema.sql`, идемпотентна).
2. Сборка и тесты: `mvn clean package` → `target/tennis-scoreboard.war`
3. Запуск: распакуйте `tools/apache-tomcat-10.1.61.zip`, скопируйте WAR в `webapps/`, запустите `bin/startup.sh|bat`. Фронтенд — http://localhost:8080/tennis-scoreboard/ (для работы из корня `/` назовите WAR `ROOT.war`).
4. В IDE: откройте проект как Maven; если IDE игнорирует `.mvn/maven.config`, укажите в настройках Maven local repository = `<проект>/m2repo` и включите Offline.

## Важно знать по фронтенду
- Фронтенд обращается к API по **относительным** путям (`matches`, `matches/{uuid}/point`), поэтому страницы должны отдаваться из корня приложения, а DispatcherServlet — не перекрывать статику (статические файлы нужны `index.html`, `css/`, `js/`, `images/`, `fonts/`).
- Форма «новый матч» дополнительно шлёт поле `matchFormat` — десериализация JSON не должна падать на неизвестных полях.
- Эндпоинты: `POST /matches`, `POST /matches/{uuid}/point`, `GET /matches/{uuid}`, `GET /matches?page=&player_name=`; ошибки — JSON `{"message": "..."}`.

## Состав зависимостей (зафиксированные версии)
Spring 6.2.19 · Hibernate 6.6.59.Final · PostgreSQL JDBC 42.7.14 · Jackson 2.18.12 · Jakarta Servlet 6.0 (Tomcat 10.1) · Lombok 1.18.48 · MapStruct 1.6.3 · JUnit 5.14.4 · embedded-postgres 2.2.2 (PostgreSQL 16.9; бинарники для Linux/Windows/macOS x64 и arm64).
