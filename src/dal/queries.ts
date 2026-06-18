import db from "~/db";
import { Difficulty, GameStatus, IGameRecord, IJigsawGame } from "~/types";
import { shufflePieces } from "~/utils/shufflePieces";
import { generateInitialPieces } from "~/utils/generateInitialPieces";
import fs from 'node:fs';
import path from 'node:path';
import { attachImageToPieces } from "~/utils/attachImageToPieces";
import { shuffleArray } from "~/utils/shuffleArray";

const imagesFolder = '/boards';
const boardImageExtensionRegexp = /\.(jpe?g|png|webp)$/i;

interface GameRecordRow {
  id: string;
  profileId: string;
  difficulty: Difficulty;
  challengeMode: 0 | 1;
  startedAt: number;
  finishedAt: number | null;
  time: number | null;
  points: number | null;
  status: GameStatus;
}

interface GameStateRow {
  gameState: string | null;
}

function mapGameRecord(row: GameRecordRow): IGameRecord {
  return {
    ...row,
    challengeMode: Boolean(row.challengeMode),
  };
}

function getBoardImageFiles() {
  const imagesPath = path.join(process.cwd(), 'public', imagesFolder);

  return fs.readdirSync(imagesPath).filter(file => boardImageExtensionRegexp.test(file));
}

function getBoardIdsFromFiles(files: string[]) {
  return files.map(file => path.basename(file, path.extname(file)));
}

async function getGameByImageFile(gameId: string, imageFile: string, difficulty: Difficulty): Promise<IJigsawGame> {
  const image = path.join(imagesFolder, imageFile);
  const initialPieces = generateInitialPieces(difficulty);
  const filePath = path.join(process.cwd(), 'public', image);
  const piecesWithImages = await attachImageToPieces(filePath, initialPieces, difficulty);
  const { pieces, playablePieces } = await shufflePieces(piecesWithImages, difficulty);
  const imageFileName = path.basename(image, path.extname(image));
  const shuffledBoardsIds = await getShuffledBoardsIds(imageFileName);

  return {
    id: gameId,
    imageFileName,
    shuffledBoardsIds,
    difficulty,
    pieces,
    initialPieces: piecesWithImages,
    playablePieces,
  };
}

export async function getGameById(id: string, difficulty: Difficulty = 'easy'): Promise<IJigsawGame> {
  const imageFiles = getBoardImageFiles();
  if (imageFiles.length === 0) {
    throw new Error('No images found in the images folder');
  }
  const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];

  return getGameByImageFile(id, randomImage, difficulty);
}

export async function getGameByBoardId(
  gameId: string,
  boardId: string,
  difficulty: Difficulty = 'easy'
): Promise<IJigsawGame> {
  const imageFiles = getBoardImageFiles();
  const imageFile = imageFiles.find(file => path.basename(file, path.extname(file)) === boardId);

  if (!imageFile) {
    throw new Error(`Board "${boardId}" not found`);
  }

  return getGameByImageFile(gameId, imageFile, difficulty);
}

export async function getAllBoardsIds(): Promise<string[]> {
  return getBoardIdsFromFiles(getBoardImageFiles());
}

export async function getShuffledBoardsIds(excludeId?: string): Promise<string[]> {
  const boardIds = await getAllBoardsIds();

  return shuffleArray(boardIds.filter(boardId => boardId !== excludeId));
}

export async function createGameRecord(
  game: Omit<IGameRecord, 'startedAt' | 'finishedAt' | 'time' | 'points' | 'status'>
) {
  const startedAt = Date.now();

  db.query(`
    INSERT INTO games (id, profileId, difficulty, challengeMode, startedAt, finishedAt, time, points, status)
    VALUES ($id, $profileId, $difficulty, $challengeMode, $startedAt, NULL, NULL, NULL, 'active')
  `).run({
    $id: game.id,
    $profileId: game.profileId,
    $difficulty: game.difficulty,
    $challengeMode: game.challengeMode ? 1 : 0,
    $startedAt: startedAt,
  });
}

export async function getGameRecordById(id: string): Promise<IGameRecord | null> {
  const row = db.query(`
    SELECT id, profileId, difficulty, challengeMode, startedAt, finishedAt, time, points, status
    FROM games
    WHERE id = $id
  `).get({ $id: id }) as GameRecordRow | null;

  return row ? mapGameRecord(row) : null;
}

function parseGameState(row: GameStateRow | null): IJigsawGame | null {
  if (!row?.gameState) return null;

  return JSON.parse(row.gameState) as IJigsawGame;
}

export async function getOrCreateGameState(game: Pick<IGameRecord, 'id' | 'difficulty'>): Promise<IJigsawGame> {
  const existingGameState = parseGameState(db.query(`
    SELECT gameState
    FROM games
    WHERE id = $id
  `).get({ $id: game.id }) as GameStateRow | null);

  if (existingGameState) {
    return existingGameState;
  }

  const gameState = await getGameById(game.id, game.difficulty);
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

  return createdGameState ?? gameState;
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

  db.query(`
    UPDATE games
    SET status = $status,
      finishedAt = $finishedAt,
      time = $time,
      gameState = COALESCE($gameState, gameState)
    WHERE id = $id AND status = 'active'
  `).run({
    $id: id,
    $status: status,
    $finishedAt: finishedAt,
    $time: time,
    $gameState: gameState ? JSON.stringify(gameState) : null,
  });

  return getGameRecordById(id);
}
