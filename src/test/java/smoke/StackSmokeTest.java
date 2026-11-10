package smoke;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.zonky.test.db.postgres.embedded.EmbeddedPostgres;
import lombok.Data;
import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.junit.jupiter.api.Test;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

/** Проверка, что весь стек работает офлайн. Можно удалить, когда появятся настоящие тесты. */
class StackSmokeTest {

    @Data static class A { String name; }
    @Data static class B { String name; }
    @Mapper interface M { B map(A a); }

    @Test
    void lombokMapstructJackson() throws Exception {
        A a = new A(); a.setName("Federer");
        B b = Mappers.getMapper(M.class).map(a);
        assertEquals("{\"name\":\"Federer\"}", new ObjectMapper().writeValueAsString(b));
    }

    @Test
    void springContextStarts() {
        try (var ctx = new AnnotationConfigApplicationContext()) {
            ctx.refresh();
            assertTrue(ctx.isActive());
        }
    }

    @Test
    void postgresSchemaAndHibernate() throws Exception {
        try (EmbeddedPostgres pg = EmbeddedPostgres.start();
             Connection c = pg.getPostgresDatabase().getConnection()) {
            c.createStatement().execute(Files.readString(Path.of("db/schema.sql")));
            c.createStatement().execute("INSERT INTO players(name) VALUES ('A'),('B')");
            c.createStatement().execute("INSERT INTO matches(player1,player2,winner) VALUES (1,2,1)");
            assertThrows(SQLException.class, () ->
                    c.createStatement().execute("INSERT INTO players(name) VALUES ('A')"), "unique name");
            assertThrows(SQLException.class, () ->
                    c.createStatement().execute("INSERT INTO matches(player1,player2,winner) VALUES (1,2,3)"));

            var registry = new StandardServiceRegistryBuilder()
                    .applySetting("hibernate.connection.url", pg.getJdbcUrl("postgres", "postgres"))
                    .applySetting("hibernate.connection.username", "postgres")
                    .applySetting("hibernate.connection.provider_class",
                            "org.hibernate.hikaricp.internal.HikariCPConnectionProvider")
                    .applySetting("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
                    .build();
            try (var sf = new MetadataSources(registry).buildMetadata().buildSessionFactory();
                 var s = sf.openSession()) {
                assertEquals(1L, s.createNativeQuery("select count(*) from matches", Long.class).getSingleResult());
            }
        }
    }
}
