import { Difficulty, IJigsawGame } from "~/types";
import { shufflePieces } from "~/utils/shufflePieces";
import { generateInitialPieces } from "~/utils/generateInitialPieces";
import fs from 'node:fs';
import path from 'node:path';
import { attachImageToPieces } from "~/utils/attachImageToPieces";
import { shuffleArray } from "~/utils/shuffleArray";

const imagesFolder = '/boards';
const boardImageExtensionRegexp = /\.(jpe?g|png|webp)$/i;

function getBoardImageFiles() {
  const imagesPath = path.join(process.cwd(), 'public', imagesFolder);

  return fs.readdirSync(imagesPath).filter(file => boardImageExtensionRegexp.test(file));
}

function getBoardIdsFromFiles(files: string[]) {
  return files.map(file => path.basename(file, path.extname(file)));
}

export async function getGameById(id: string, difficulty: Difficulty = 'easy'): Promise<IJigsawGame> {
  const imageFiles = getBoardImageFiles();
  if (imageFiles.length === 0) {
    throw new Error('No images found in the images folder');
  }
  const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  const image = path.join(imagesFolder, randomImage);

  const initialPieces = generateInitialPieces(difficulty);
  const filePath = path.join(process.cwd(), 'public', image);
  const piecesWithImages = await attachImageToPieces(filePath, initialPieces, difficulty);
  const { pieces, playablePieces } = await shufflePieces(piecesWithImages, difficulty);
  const imageFileName = path.basename(image, path.extname(image));
  const shuffledBoardsIds = await getShuffledBoardsIds(imageFileName);

  return {
    id,
    imageFileName,
    shuffledBoardsIds,
    difficulty,
    pieces,
    initialPieces: piecesWithImages,
    playablePieces,
  };
}

export async function getAllBoardsIds(): Promise<string[]> {
  return getBoardIdsFromFiles(getBoardImageFiles());
}

export async function getShuffledBoardsIds(excludeId?: string): Promise<string[]> {
  const boardIds = await getAllBoardsIds();

  return shuffleArray(boardIds.filter(boardId => boardId !== excludeId));
}
