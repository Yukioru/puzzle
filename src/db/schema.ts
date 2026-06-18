import { Database } from "bun:sqlite";

interface TableInfoRow {
  name: string;
  notnull: 0 | 1;
}

function createGamesTable(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      profileId TEXT NOT NULL,
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      challengeMode INTEGER NOT NULL CHECK (challengeMode IN (0, 1)),
      startedAt INTEGER NOT NULL DEFAULT 0 CHECK (startedAt >= 0),
      finishedAt INTEGER CHECK (finishedAt IS NULL OR finishedAt >= startedAt),
      time INTEGER CHECK (time IS NULL OR time >= 0),
      points INTEGER CHECK (points IS NULL OR points >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
      gameState TEXT
    ) STRICT;
  `);
}

function tableExists(db: Database, tableName: string) {
  const row = db.query(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table' AND name = $tableName
  `).get({ $tableName: tableName });

  return Boolean(row);
}

function ensureGamesTimeCanBeEmpty(db: Database) {
  const timeColumn = db.query(`PRAGMA table_info(games)`)
    .all()
    .find((column) => (column as TableInfoRow).name === 'time') as TableInfoRow | undefined;

  if (!timeColumn?.notnull) return;

  const migrate = db.transaction(() => {
    db.run('ALTER TABLE games RENAME TO games_old');
    createGamesTable(db);
    db.run(`
      INSERT INTO games (id, profileId, difficulty, challengeMode, time, points)
      SELECT id, profileId, difficulty, challengeMode, time, points
      FROM games_old
    `);
    db.run('DROP TABLE games_old');
  });

  migrate();
}

function ensureGamesStatusColumn(db: Database) {
  const hasStatusColumn = db.query(`PRAGMA table_info(games)`)
    .all()
    .some((column) => (column as TableInfoRow).name === 'status');

  if (hasStatusColumn) return;

  db.run(`
    ALTER TABLE games
    ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'abandoned'))
  `);
}

function hasGamesColumn(db: Database, columnName: string) {
  return db.query(`PRAGMA table_info(games)`)
    .all()
    .some((column) => (column as TableInfoRow).name === columnName);
}

function ensureGamesTimerColumns(db: Database) {
  const now = Date.now();

  if (!hasGamesColumn(db, 'startedAt')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN startedAt INTEGER NOT NULL DEFAULT 0
      CHECK (startedAt >= 0)
    `);
  }

  if (!hasGamesColumn(db, 'finishedAt')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN finishedAt INTEGER
      CHECK (finishedAt IS NULL OR finishedAt >= startedAt)
    `);
  }

  db.query(`
    UPDATE games
    SET startedAt = $now
    WHERE startedAt = 0
  `).run({ $now: now });
}

function ensureGamesStateColumn(db: Database) {
  if (hasGamesColumn(db, 'gameState')) return;

  db.run(`
    ALTER TABLE games
    ADD COLUMN gameState TEXT
  `);
}

export function initializeDatabase(db: Database) {
  const gamesTableExists = tableExists(db, 'games');

  createGamesTable(db);

  if (gamesTableExists) {
    ensureGamesTimeCanBeEmpty(db);
    ensureGamesStatusColumn(db);
    ensureGamesTimerColumns(db);
    ensureGamesStateColumn(db);
  }
}
