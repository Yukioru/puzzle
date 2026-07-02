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
      gameMode TEXT NOT NULL DEFAULT 'classic' CHECK (gameMode IN ('classic', 'endurance', 'infinity')),
      challengeMode INTEGER NOT NULL CHECK (challengeMode IN (0, 1)),
      startedAt INTEGER NOT NULL DEFAULT 0 CHECK (startedAt >= 0),
      finishedAt INTEGER CHECK (finishedAt IS NULL OR finishedAt >= startedAt),
      time INTEGER CHECK (time IS NULL OR time >= 0),
      points INTEGER CHECK (points IS NULL OR points >= 0),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
      gameState TEXT,
      challengeRound INTEGER NOT NULL DEFAULT 1 CHECK (challengeRound >= 1),
      challengeTimeLeft INTEGER CHECK (challengeTimeLeft IS NULL OR challengeTimeLeft >= 0),
      challengeLastTickAt INTEGER CHECK (challengeLastTickAt IS NULL OR challengeLastTickAt >= 0),
      challengePausedAt INTEGER CHECK (challengePausedAt IS NULL OR challengePausedAt >= 0),
      challengeNextGameState TEXT
    ) STRICT;
  `);
}

function createGameRoundsTable(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS game_rounds (
      id TEXT PRIMARY KEY,
      gameId TEXT NOT NULL,
      round INTEGER NOT NULL CHECK (round >= 1),
      difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
      startedAt INTEGER NOT NULL CHECK (startedAt >= 0),
      finishedAt INTEGER NOT NULL CHECK (finishedAt >= startedAt),
      roundTime INTEGER NOT NULL CHECK (roundTime >= 0),
      basePoints INTEGER NOT NULL CHECK (basePoints >= 0),
      speedMultiplier REAL NOT NULL CHECK (speedMultiplier >= 0),
      speedPoints INTEGER NOT NULL CHECK (speedPoints >= 0),
      milestoneBonus INTEGER NOT NULL CHECK (milestoneBonus >= 0),
      totalPoints INTEGER NOT NULL CHECK (totalPoints >= 0),
      timeBonus INTEGER NOT NULL CHECK (timeBonus >= 0),
      createdAt INTEGER NOT NULL CHECK (createdAt >= 0),
      FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE,
      UNIQUE (gameId, round)
    ) STRICT;
  `);
}

function createAppSettingsTable(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt INTEGER NOT NULL CHECK (updatedAt >= 0)
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

function ensureGamesChallengeColumns(db: Database) {
  if (!hasGamesColumn(db, 'challengeRound')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN challengeRound INTEGER NOT NULL DEFAULT 1
      CHECK (challengeRound >= 1)
    `);
  }

  if (!hasGamesColumn(db, 'challengeTimeLeft')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN challengeTimeLeft INTEGER
      CHECK (challengeTimeLeft IS NULL OR challengeTimeLeft >= 0)
    `);
  }

  if (!hasGamesColumn(db, 'challengeLastTickAt')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN challengeLastTickAt INTEGER
      CHECK (challengeLastTickAt IS NULL OR challengeLastTickAt >= 0)
    `);
  }

  if (!hasGamesColumn(db, 'challengePausedAt')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN challengePausedAt INTEGER
      CHECK (challengePausedAt IS NULL OR challengePausedAt >= 0)
    `);
  }

  if (!hasGamesColumn(db, 'challengeNextGameState')) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN challengeNextGameState TEXT
    `);
  }
}

function ensureGamesModeColumn(db: Database) {
  const hadGameModeColumn = hasGamesColumn(db, 'gameMode');

  if (!hadGameModeColumn) {
    db.run(`
      ALTER TABLE games
      ADD COLUMN gameMode TEXT NOT NULL DEFAULT 'classic'
      CHECK (gameMode IN ('classic', 'endurance', 'infinity'))
    `);
  }

  if (!hadGameModeColumn) {
    db.run(`
      UPDATE games
      SET gameMode = CASE
        WHEN challengeMode = 1 THEN 'endurance'
        ELSE 'classic'
      END
    `);
  }
}

export function initializeDatabase(db: Database) {
  const gamesTableExists = tableExists(db, 'games');

  createGamesTable(db);
  createGameRoundsTable(db);
  createAppSettingsTable(db);

  if (gamesTableExists) {
    ensureGamesTimeCanBeEmpty(db);
    ensureGamesStatusColumn(db);
    ensureGamesTimerColumns(db);
    ensureGamesStateColumn(db);
    ensureGamesChallengeColumns(db);
    ensureGamesModeColumn(db);
  }
}
