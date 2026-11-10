package dev;

import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Локальный PostgreSQL без установки и без интернета.
 * Запуск: scripts/start-db.sh (Linux/macOS) или scripts\start-db.bat (Windows).
 * Подключение: jdbc:postgresql://localhost:5432/tennis, user=postgres, пароль любой (trust-авторизация).
 * Данные хранятся в каталоге .pgdata (удалите его, чтобы сбросить БД).
 */
public class DevDatabase {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getProperty("db.port", "5432"));
        Path data = Path.of(System.getProperty("db.dir", ".pgdata")).toAbsolutePath();

        EmbeddedPostgres pg = EmbeddedPostgres.builder()
                .setPort(port)
                .setDataDirectory(data)
                .setCleanDataDirectory(false)
                .start();

        try (Connection c = pg.getPostgresDatabase().getConnection(); Statement s = c.createStatement()) {
            var exists = s.executeQuery("SELECT 1 FROM pg_database WHERE datname = 'tennis'");
            if (!exists.next()) s.execute("CREATE DATABASE tennis");
        }
        try (Connection c = pg.getDatabase("postgres", "tennis").getConnection(); Statement s = c.createStatement()) {
            s.execute(Files.readString(Path.of("db/schema.sql")));
        }

        System.out.println("PostgreSQL started: jdbc:postgresql://localhost:" + port + "/tennis (user postgres)");
        System.out.println("Stop: Ctrl+C");
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try { pg.close(); } catch (Exception ignored) { }
        }));
        Thread.currentThread().join();
    }
}
