-- Схема БД «Теннисное табло» (PostgreSQL), строго по ТЗ.
-- Сохраняются только завершённые матчи; текущие живут в памяти приложения.

CREATE TABLE IF NOT EXISTS players (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_players_name ON players (name);

CREATE TABLE IF NOT EXISTS matches (
    id      SERIAL PRIMARY KEY,
    player1 INTEGER NOT NULL REFERENCES players (id),
    player2 INTEGER NOT NULL REFERENCES players (id),
    winner  INTEGER NOT NULL REFERENCES players (id),
    CONSTRAINT ck_matches_players_differ CHECK (player1 <> player2),
    CONSTRAINT ck_matches_winner_is_player CHECK (winner = player1 OR winner = player2)
);
CREATE INDEX IF NOT EXISTS ix_matches_player1 ON matches (player1);
CREATE INDEX IF NOT EXISTS ix_matches_player2 ON matches (player2);
