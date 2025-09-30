import { Difficulty, IJigsawGame } from "~/types";
import { shufflePieces } from "~/utils/shufflePieces";
import { generateInitialPieces } from "~/utils/generateInitialPieces";
import fs from 'node:fs';
import path from 'node:path';
import { attachImageToPieces } from "~/utils/attachImageToPieces";

const imagesFolder = '/boards';

export async function getGameById(id: string, difficulty: Difficulty = 'easy'): Promise<IJigsawGame> {
  const imagesPath = path.join(process.cwd(), 'public', imagesFolder);
  const imageFiles = fs.readdirSync(imagesPath).filter(file => /\.(jpe?g|png|webp)$/i.test(file));
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

  return {
    id,
    imageFileName,
    difficulty,
    pieces,
    initialPieces: piecesWithImages,
    playablePieces,
  };
}