import db from "~/db";
import { Difficulty, DifficultyLeaderboardEntry, EnduranceLeaderboardEntry, GameStatus, IGameRecord, IJigsawGame, StoredGameMode } from "~/types";
import { shufflePieces } from "~/utils/shufflePieces";
import { generateInitialPieces } from "~/utils/generateInitialPieces";
import fs from 'node:fs';
import path from 'node:path';
import { attachImageToPieces } from "~/utils/attachImageToPieces";
import { shuffleArray } from "~/utils/shuffleArray";
import { getBoardPalette } from "~/utils/boardPalettes";
import {
  calculateEnduranceRoundResult,
  getEnduranceDifficulty,
  getEnduranceRank,
} from "~/utils/endurance";
import { getBoardSettings, getEnduranceSettings } from "~/dal/settings";
import { notifyLeaderboardsChanged } from "~/dal/leaderboardEvents";

const boardsManifestPath = path.join(process.cwd(), 'public', 'boards.json');
const profilesBoardsPath = path.join(process.cwd(), 'public', 'profiles.json');

interface ProfileBoardsEntry {
  faction?: string;
  boards?: string[];
}

type ProfileBoardsMap = Record<string, ProfileBoardsEntry | undefined>;

interface GameRecordRow {
  id: string;
  profileId: string;
  difficulty: Difficulty;
  gameMode: StoredGameMode;
  challengeMode: 0 | 1;
  startedAt: number;
  finishedAt: number | null;
  time: number | null;
  points: number | null;
  status: GameStatus;
  challengeRound: number;
  challengeTimeLeft: number | null;
  challengeLastTickAt: number | null;
  challengePausedAt: number | null;
}

interface GameStateRow {
  gameState: string | null;
}

interface NextGameStateRow {
  challengeNextGameState: string | null;
}

interface EnduranceLeaderboardRow {
  gameId: string;
  profileId: string;
  points: number;
  rounds: number;
  time: number;
}

interface DifficultyLeaderboardRow {
  gameId: string;
  profileId: string;
  difficulty: Difficulty;
  time: number;
}

function mapGameRecord(row: GameRecordRow): IGameRecord {
  return {
    ...row,
    challengeMode: Boolean(row.challengeMode),
  };
}

function getBoardIdsFromManifest() {
  try {
    return JSON.parse(fs.readFileSync(boardsManifestPath, 'utf8')) as string[];
  } catch {
    return [];
  }
}

function getProfileBoardsMap(): ProfileBoardsMap {
  if (!fs.existsSync(profilesBoardsPath)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(profilesBoardsPath, 'utf8')) as ProfileBoardsMap;
  } catch {
    return {};
  }
}

async function getProfileMatchedBoardQueue(profileId: string): Promise<string[]> {
  const boardIds = await getAllBoardsIds();
  const availableBoardIds = new Set(boardIds);
  const matchedBoardIds = (getProfileBoardsMap()[profileId]?.boards ?? [])
    .filter((boardId) => availableBoardIds.has(boardId));

  if (matchedBoardIds.length === 0) {
    return [];
  }

  const matchedBoardIdsSet = new Set(matchedBoardIds);
  const remainingBoardIds = boardIds.filter((boardId) => !matchedBoardIdsSet.has(boardId));

  return [
    ...shuffleArray(matchedBoardIds),
    ...shuffleArray(remainingBoardIds),
  ];
}

async function addMissingBoardPalette(gameState: IJigsawGame): Promise<IJigsawGame> {
  if (gameState.palette) {
    return gameState;
  }

  return {
    ...gameState,
    palette: getBoardPalette(gameState.imageFileName),
  };
}

async function getGameByBoardIdUnchecked(gameId: string, boardId: string, difficulty: Difficulty): Promise<IJigsawGame> {
  const initialPieces = generateInitialPieces(difficulty);
  const piecesWithImages = await attachImageToPieces(boardId, initialPieces, difficulty);
  const { pieces, playablePieces } = await shufflePieces(piecesWithImages, difficulty);
  const shuffledBoardsIds = await getShuffledBoardsIds(boardId);
  const palette = getBoardPalette(boardId);

  return {
    id: gameId,
    imageFileName: boardId,
    shuffledBoardsIds,
    difficulty,
    palette,
    pieces,
    initialPieces: piecesWithImages,
    playablePieces,
  };
}

export async function getGameById(id: string, difficulty: Difficulty = 'easy'): Promise<IJigsawGame> {
  const boardIds = await getAllBoardsIds();
  if (boardIds.length === 0) {
    throw new Error('No boards found in the boards manifest');
  }
  const randomBoardId = boardIds[Math.floor(Math.random() * boardIds.length)];

  return getGameByBoardIdUnchecked(id, randomBoardId, difficulty);
}

export async function getGameByProfileBoardMatching(
  gameId: string,
  profileId: string,
  difficulty: Difficulty = 'easy'
): Promise<IJigsawGame> {
  const boardQueue = await getProfileMatchedBoardQueue(profileId);
  const firstBoardId = boardQueue[0];

  if (!firstBoardId) {
    return getGameById(gameId, difficulty);
  }

  const gameState = await getGameByBoardId(gameId, firstBoardId, difficulty);

  return {
    ...gameState,
    shuffledBoardsIds: boardQueue.slice(1),
  };
}

export async function getGameByBoardId(
  gameId: string,
  boardId: string,
  difficulty: Difficulty = 'easy'
): Promise<IJigsawGame> {
  const boardIds = await getAllBoardsIds();

  if (!boardIds.includes(boardId)) {
    throw new Error(`Board "${boardId}" not found`);
  }

  return getGameByBoardIdUnchecked(gameId, boardId, difficulty);
}

export async function getAllBoardsIds(): Promise<string[]> {
  return getBoardIdsFromManifest();
}

export async function getShuffledBoardsIds(excludeId?: string): Promise<string[]> {
  const boardIds = await getAllBoardsIds();

  return shuffleArray(boardIds.filter(boardId => boardId !== excludeId));
}

export async function getEnduranceLeaderboard(limit = 25): Promise<EnduranceLeaderboardEntry[]> {
  const enduranceSettings = getEnduranceSettings();
  const rows = db.query(`
    SELECT
      id AS gameId,
      profileId,
      COALESCE(points, 0) AS points,
      MAX(challengeRound - 1, 0) AS rounds,
      COALESCE(time, 0) AS time
    FROM games
    WHERE gameMode = 'endurance'
      AND status != 'active'
      AND COALESCE(points, 0) > 0
    ORDER BY points DESC, rounds DESC, time ASC
    LIMIT $limit
  `).all({ $limit: limit }) as EnduranceLeaderboardRow[];

  return rows.map((row) => ({
    ...row,
    rank: getEnduranceRank(row.points, enduranceSettings),
  }));
}

export async function getDifficultyLeaderboard(
  difficulty: Difficulty,
  limit = 10
): Promise<DifficultyLeaderboardEntry[]> {
  return db.query(`
    SELECT
      id AS gameId,
      profileId,
      difficulty,
      time
    FROM games
    WHERE gameMode = 'classic'
      AND status = 'completed'
      AND difficulty = $difficulty
      AND time IS NOT NULL
    ORDER BY time ASC, finishedAt ASC
    LIMIT $limit
  `).all({
    $difficulty: difficulty,
    $limit: limit,
  }) as DifficultyLeaderboardRow[];
}

export async function getDifficultyLeaderboards(limit = 10): Promise<Record<Difficulty, DifficultyLeaderboardEntry[]>> {
  const [easy, medium, hard] = await Promise.all([
    getDifficultyLeaderboard('easy', limit),
    getDifficultyLeaderboard('medium', limit),
    getDifficultyLeaderboard('hard', limit),
  ]);

  return {
    easy,
    medium,
    hard,
  };
}

export async function createGameRecord(
  game: Pick<IGameRecord, 'id' | 'profileId' | 'difficulty' | 'gameMode' | 'challengeMode'>
) {
  const startedAt = Date.now();
  const enduranceSettings = getEnduranceSettings();
  const isEndurance = game.gameMode === 'endurance';
  const challengeTimeLeft = isEndurance ? enduranceSettings.initialTime : null;
  const challengeLastTickAt = isEndurance ? startedAt : null;

  db.query(`
    INSERT INTO games (
      id,
      profileId,
      difficulty,
      gameMode,
      challengeMode,
      startedAt,
      finishedAt,
      time,
      points,
      status,
      challengeRound,
      challengeTimeLeft,
      challengeLastTickAt,
      challengePausedAt
    )
    VALUES (
      $id,
      $profileId,
      $difficulty,
      $gameMode,
      $challengeMode,
      $startedAt,
      NULL,
      NULL,
      $points,
      'active',
      1,
      $challengeTimeLeft,
      $challengeLastTickAt,
      NULL
    )
  `).run({
    $id: game.id,
    $profileId: game.profileId,
    $difficulty: game.difficulty,
    $gameMode: game.gameMode,
    $challengeMode: game.challengeMode ? 1 : 0,
    $startedAt: startedAt,
    $points: isEndurance ? 0 : null,
    $challengeTimeLeft: challengeTimeLeft,
    $challengeLastTickAt: challengeLastTickAt,
  });
}

export async function getGameRecordById(id: string): Promise<IGameRecord | null> {
  const row = db.query(`
    SELECT
      id,
      profileId,
      difficulty,
      gameMode,
      challengeMode,
      startedAt,
      finishedAt,
      time,
      points,
      status,
      challengeRound,
      challengeTimeLeft,
      challengeLastTickAt,
      challengePausedAt
    FROM games
    WHERE id = $id
  `).get({ $id: id }) as GameRecordRow | null;

  return row ? mapGameRecord(row) : null;
}

function parseGameState(row: GameStateRow | null): IJigsawGame | null {
  if (!row?.gameState) return null;

  return JSON.parse(row.gameState) as IJigsawGame;
}

function parseNextGameState(row: NextGameStateRow | null): IJigsawGame | null {
  if (!row?.challengeNextGameState) return null;

  return JSON.parse(row.challengeNextGameState) as IJigsawGame;
}

async function getEnduranceNextGameState({
  gameId,
  currentGameState,
  nextDifficulty,
}: {
  gameId: string;
  currentGameState: IJigsawGame;
  nextDifficulty: Difficulty;
}) {
  const currentQueue = currentGameState.shuffledBoardsIds.length > 0
    ? currentGameState.shuffledBoardsIds
    : await getShuffledBoardsIds(currentGameState.imageFileName);
  const nextBoardId = currentQueue[0];

  if (!nextBoardId) {
    return getGameById(gameId, nextDifficulty);
  }

  const nextGameState = await getGameByBoardId(gameId, nextBoardId, nextDifficulty);

  return {
    ...nextGameState,
    shuffledBoardsIds: currentQueue.slice(1),
  };
}

export async function getOrCreateGameState(game: Pick<IGameRecord, 'id' | 'difficulty' | 'profileId'>): Promise<IJigsawGame> {
  const existingGameState = parseGameState(db.query(`
    SELECT gameState
    FROM games
    WHERE id = $id
  `).get({ $id: game.id }) as GameStateRow | null);

  if (existingGameState) {
    return addMissingBoardPalette(existingGameState);
  }

  const boardSettings = getBoardSettings();
  const gameState = boardSettings.matchProfileBoards
    ? await getGameByProfileBoardMatching(game.id, game.profileId, game.difficulty)
    : await getGameById(game.id, game.difficulty);
  const result = db.query(`
    UPDATE games
    SET gameState = $gameState
    WHERE id = $id AND gameState IS NULL
  `).run({
    $id: game.id,
    $gameState: JSON.stringify(gameState),
  });

  if (result.changes > 0) {
    return gameState;
  }

  const createdGameState = parseGameState(db.query(`
    SELECT gameState
    FROM games
    WHERE id = $id
  `).get({ $id: game.id }) as GameStateRow | null);

  return createdGameState
    ? addMissingBoardPalette(createdGameState)
    : gameState;
}

export async function finishGameRecord(
  id: string,
  status: Extract<GameStatus, 'completed' | 'abandoned'>,
  gameState?: IJigsawGame
) {
  const game = await getGameRecordById(id);

  if (!game) return null;
  if (game.status !== 'active') return game;

  const finishedAt = Date.now();
  const time = Math.max(0, finishedAt - game.startedAt);
  const challengeTimeLeft = game.gameMode === 'endurance'
    ? game.challengePausedAt
      ? game.challengeTimeLeft
      : Math.max(0, (game.challengeTimeLeft ?? 0) - (finishedAt - (game.challengeLastTickAt ?? game.startedAt)))
    : game.challengeTimeLeft;

  const result = db.query(`
    UPDATE games
    SET status = $status,
      finishedAt = $finishedAt,
      time = $time,
      challengeTimeLeft = $challengeTimeLeft,
      challengeLastTickAt = $finishedAt,
      challengePausedAt = NULL,
      gameState = COALESCE($gameState, gameState)
    WHERE id = $id AND status = 'active'
  `).run({
    $id: id,
    $status: status,
    $finishedAt: finishedAt,
    $time: time,
    $challengeTimeLeft: challengeTimeLeft,
    $gameState: gameState ? JSON.stringify(gameState) : null,
  });

  if (result.changes > 0) {
    notifyLeaderboardsChanged();
  }

  return getGameRecordById(id);
}

export async function prepareEnduranceNextRound(id: string) {
  const game = await getGameRecordById(id);

  if (!game || game.status !== 'active' || !game.challengeMode) {
    return null;
  }

  const existingNextGameState = parseNextGameState(db.query(`
    SELECT challengeNextGameState
    FROM games
    WHERE id = $id
  `).get({ $id: id }) as NextGameStateRow | null);

  if (existingNextGameState) {
    return addMissingBoardPalette(existingNextGameState);
  }

  const nextDifficulty = getEnduranceDifficulty(game.challengeRound + 1);
  const currentGameState = await getOrCreateGameState(game);
  const nextGameState = await getEnduranceNextGameState({
    gameId: id,
    currentGameState,
    nextDifficulty,
  });
  const result = db.query(`
    UPDATE games
    SET challengeNextGameState = $challengeNextGameState
    WHERE id = $id
      AND status = 'active'
      AND challengeNextGameState IS NULL
  `).run({
    $id: id,
    $challengeNextGameState: JSON.stringify(nextGameState),
  });

  if (result.changes > 0) {
    return nextGameState;
  }

  const currentNextGameState = parseNextGameState(db.query(`
    SELECT challengeNextGameState
    FROM games
    WHERE id = $id
  `).get({ $id: id }) as NextGameStateRow | null);

  return currentNextGameState
    ? addMissingBoardPalette(currentNextGameState)
    : nextGameState;
}

export async function pauseEnduranceGame(id: string) {
  const game = await getGameRecordById(id);

  if (!game || game.status !== 'active' || game.gameMode !== 'endurance' || game.challengePausedAt) {
    return game;
  }

  const now = Date.now();
  const lastTickAt = game.challengeLastTickAt ?? game.startedAt;
  const challengeTimeLeft = Math.max(0, (game.challengeTimeLeft ?? 0) - (now - lastTickAt));

  db.query(`
    UPDATE games
    SET challengePausedAt = $now,
      challengeLastTickAt = NULL,
      challengeTimeLeft = $challengeTimeLeft
    WHERE id = $id AND status = 'active'
  `).run({
    $id: id,
    $now: now,
    $challengeTimeLeft: challengeTimeLeft,
  });

  return getGameRecordById(id);
}

export async function resumeEnduranceGame(id: string) {
  const game = await getGameRecordById(id);

  if (!game || game.status !== 'active' || game.gameMode !== 'endurance' || !game.challengePausedAt) {
    return game;
  }

  db.query(`
    UPDATE games
    SET challengePausedAt = NULL,
      challengeLastTickAt = $now
    WHERE id = $id AND status = 'active'
  `).run({
    $id: id,
    $now: Date.now(),
  });

  return getGameRecordById(id);
}

export async function completeEnduranceRound(
  id: string,
  gameState: IJigsawGame,
  { nextGamePreloaded = false }: { nextGamePreloaded?: boolean } = {}
) {
  const game = await getGameRecordById(id);

  if (!game || game.status !== 'active' || !game.challengeMode) {
    return null;
  }

  if (game.gameMode === 'infinity') {
    const nextRound = game.challengeRound + 1;
    const nextDifficulty = getEnduranceDifficulty(nextRound);
    const preparedNextGameState = parseNextGameState(db.query(`
      SELECT challengeNextGameState
      FROM games
      WHERE id = $id
    `).get({ $id: id }) as NextGameStateRow | null);
    const nextGameState = preparedNextGameState
      ? await addMissingBoardPalette(preparedNextGameState)
      : await getEnduranceNextGameState({
        gameId: id,
        currentGameState: gameState,
        nextDifficulty,
      });

    db.query(`
      UPDATE games
      SET difficulty = $difficulty,
        challengeRound = $challengeRound,
        challengeNextGameState = NULL,
        gameState = $gameState
      WHERE id = $id AND status = 'active'
    `).run({
      $id: id,
      $difficulty: nextDifficulty,
      $challengeRound: nextRound,
      $gameState: JSON.stringify(nextGameState),
    });

    const updatedGame = await getGameRecordById(id);

    return updatedGame
      ? {
        gameRecord: updatedGame,
        gameState: nextGameState,
        roundResult: null,
      }
      : null;
  }

  const now = Date.now();
  const lastTickAt = game.challengeLastTickAt ?? game.startedAt;
  const currentTimeLeft = game.challengePausedAt
    ? (game.challengeTimeLeft ?? 0)
    : Math.max(0, (game.challengeTimeLeft ?? 0) - (now - lastTickAt));

  if (currentTimeLeft <= 0) {
    const finishedGame = await finishGameRecord(id, 'completed', gameState);

    return finishedGame
      ? {
        gameRecord: finishedGame,
        gameState,
        roundResult: null,
      }
      : null;
  }

  const roundStartedAt = game.challengeLastTickAt ?? game.startedAt;
  const roundTime = Math.max(0, now - roundStartedAt);
  const enduranceSettings = getEnduranceSettings();
  const roundResult = calculateEnduranceRoundResult({
    round: game.challengeRound,
    difficulty: game.difficulty,
    roundTime,
    settings: enduranceSettings,
  });
  const nextRound = game.challengeRound + 1;
  const nextDifficulty = getEnduranceDifficulty(nextRound);
  const preparedNextGameState = parseNextGameState(db.query(`
    SELECT challengeNextGameState
    FROM games
    WHERE id = $id
  `).get({ $id: id }) as NextGameStateRow | null);
  const nextGameState = preparedNextGameState
    ? await addMissingBoardPalette(preparedNextGameState)
    : await getEnduranceNextGameState({
      gameId: id,
      currentGameState: gameState,
      nextDifficulty,
    });
  const nextTimeLeft = currentTimeLeft + roundResult.timeBonus;
  const nextPoints = (game.points ?? 0) + roundResult.totalPoints;
  const shouldPause = !nextGamePreloaded;

  const completeRound = db.transaction(() => {
    db.query(`
      INSERT INTO game_rounds (
        id,
        gameId,
        round,
        difficulty,
        startedAt,
        finishedAt,
        roundTime,
        basePoints,
        speedMultiplier,
        speedPoints,
        milestoneBonus,
        totalPoints,
        timeBonus,
        createdAt
      )
      VALUES (
        $id,
        $gameId,
        $round,
        $difficulty,
        $startedAt,
        $finishedAt,
        $roundTime,
        $basePoints,
        $speedMultiplier,
        $speedPoints,
        $milestoneBonus,
        $totalPoints,
        $timeBonus,
        $createdAt
      )
    `).run({
      $id: crypto.randomUUID(),
      $gameId: id,
      $round: game.challengeRound,
      $difficulty: game.difficulty,
      $startedAt: roundStartedAt,
      $finishedAt: now,
      $roundTime: roundTime,
      $basePoints: roundResult.basePoints,
      $speedMultiplier: roundResult.speedMultiplier,
      $speedPoints: roundResult.speedPoints,
      $milestoneBonus: roundResult.milestoneBonus,
      $totalPoints: roundResult.totalPoints,
      $timeBonus: roundResult.timeBonus,
      $createdAt: now,
    });

    db.query(`
      UPDATE games
      SET difficulty = $difficulty,
        points = $points,
        challengeRound = $challengeRound,
        challengeTimeLeft = $challengeTimeLeft,
        challengeLastTickAt = $challengeLastTickAt,
        challengePausedAt = $challengePausedAt,
        challengeNextGameState = NULL,
        gameState = $gameState
      WHERE id = $id AND status = 'active'
    `).run({
      $id: id,
      $difficulty: nextDifficulty,
      $points: nextPoints,
      $challengeRound: nextRound,
      $challengeTimeLeft: nextTimeLeft,
      $challengeLastTickAt: shouldPause ? null : now,
      $challengePausedAt: shouldPause ? now : null,
      $gameState: JSON.stringify(nextGameState),
    });
  });

  completeRound();

  const updatedGame = await getGameRecordById(id);

  if (!updatedGame) return null;

  return {
    gameRecord: updatedGame,
    gameState: nextGameState,
    roundResult,
  };
}
