import { IJigsawGame } from "~/types";
import { getDimensions } from "~/utils/getDimentions";
import { shufflePieces } from "~/utils/shufflePieces";
import { generateInitialPieces } from "~/utils/generateInitialPieces";
import fs from 'node:fs';
import path from 'node:path';
import { attachImageToPieces } from "~/utils/attachImageToPieces";

const imagesFolder = '/boards';

export async function getGameById(id: string): Promise<IJigsawGame> {
  const difficulty = 'easy';

  const imagesPath = path.join(process.cwd(), 'public', imagesFolder);
  const imageFiles = fs.readdirSync(imagesPath).filter(file => /\.(jpe?g|png|webp)$/i.test(file));
  if (imageFiles.length === 0) {
    throw new Error('No images found in the images folder');
  }
  const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
  const image = path.join(imagesFolder, randomImage);

  const boardSize = getDimensions(difficulty);
  const initialPieces = generateInitialPieces(boardSize.rows, boardSize.cols);

  const filePath = path.join(process.cwd(), 'public', image);
  const imageBuffer = fs.readFileSync(filePath);
  const piecesWithImages = await attachImageToPieces(imageBuffer, initialPieces, boardSize);
  const { pieces, playablePieces } = await shufflePieces(piecesWithImages, difficulty);

  return {
    id,
    difficulty,
    pieces,
    initialPieces: piecesWithImages,
    playablePieces,
  };
}