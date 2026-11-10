# Теннисное табло — офлайн-комплект для разработки

ТЗ: https://zhukovsd.github.io/java-backend-learning-course/projects/tennis-scoreboard/

Всё необходимое лежит в этом каталоге; интернет не нужен.
**На компьютере должен быть установлен JDK 21** (его и IDE в архив не входят).

## macOS: кратко
```sh
unzip tools/apache-maven-3.9.16-bin.zip -d ~/tools   # по желанию, если нет своего Maven; тогда ~/tools/apache-maven-3.9.16/bin/mvn
scripts/start-db.sh                                  # терминал 1: PostgreSQL
mvn clean package                                    # терминал 2: сборка + тесты
unzip tools/apache-tomcat-10.1.61.zip -d ~/tools && chmod +x ~/tools/apache-tomcat-10.1.61/bin/*.sh
cp target/tennis-scoreboard.war ~/tools/apache-tomcat-10.1.61/webapps/
~/tools/apache-tomcat-10.1.61/bin/startup.sh         # http://localhost:8080/tennis-scoreboard/
```
Если macOS блокирует скачанные бинарники PostgreSQL (Gatekeeper), выполните `xattr -dr com.apple.quarantine .pgdata ~/.embedded-postgres-binaries` или разрешите запуск в «Системных настройках → Конфиденциальность». Не проверялось на реальном Mac: бинарники PostgreSQL для darwin-amd64 и darwin-arm64 лежат в `m2repo`, но тестировал я только на Linux.

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
- **Web:** Spring MVC 6.2.19, Jakarta Servlet 6.0 (Tomcat 10.1), Jackson 2.18.12 (+jsr310)
- **HTML-шаблоны (на выбор):** Thymeleaf 3.1.6 (`thymeleaf-spring6`) или JSP + JSTL (`jakarta.servlet.jsp.jstl`, JSP API — provided от Tomcat). Для ТЗ они не обязательны: фронтенд статический.
- **БД:** Hibernate 6.6.59.Final, spring-orm, HikariCP, PostgreSQL JDBC 42.7.14, Flyway 11.20.3 (по желанию)
- **Валидация:** Hibernate Validator 8.0.3 + Expressly (EL)
- **Логи:** SLF4J 2.0.17 + Logback 1.5.38
- **Утилиты:** Lombok 1.18.48, MapStruct 1.6.3
- **Тесты:** JUnit 5.14.4 (зафиксирован через BOM), Mockito 5.24, AssertJ 3.27, spring-test (MockMvc), JSONPath, embedded-postgres 2.2.2 (PostgreSQL 16.9 для Linux/Windows/macOS x64 и arm64)

Нужна ещё библиотека? Без интернета её не докачать: добавьте её, пока есть сеть, командой
`mvn -Dmaven.repo.local=m2repo dependency:go-offline` (без `-o`; временно уберите `-o` из `.mvn/maven.config`).
