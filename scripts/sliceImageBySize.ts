import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

import { getDimensions } from "~/utils/getDimentions";

/**
 * Нарезает изображение на кусочки и сохраняет их в public/pieces/${fileName}/${difficulty}/
 * @param imagePath путь к оригинальному изображению (например public/boards/castorice.jpg)
 * @param difficulty уровень сложности ('easy' | 'medium' | 'hard')
 */
export async function sliceImageBySize(
  imagePath: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<void> {
  const fileName = path.basename(imagePath, path.extname(imagePath));
  const { rows, cols } = getDimensions(difficulty);
  const boardAspectRatio = cols / rows;
  const targetHeight = 1200;
  const targetWidth = Math.floor(targetHeight * boardAspectRatio);

  const imageBuffer = fs.readFileSync(imagePath);
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize(targetWidth, targetHeight, { fit: 'cover' })
    .toBuffer();

  const basePieceWidth = Math.floor(targetWidth / cols);
  const basePieceHeight = Math.floor(targetHeight / rows);

  const OVERLAP_PERCENT = 24;
  const overlapX = Math.floor(basePieceWidth * OVERLAP_PERCENT / 100);
  const overlapY = Math.floor(basePieceHeight * OVERLAP_PERCENT / 100);

  const standardWidth = basePieceWidth + overlapX * 2;
  const standardHeight = basePieceHeight + overlapY * 2;

  const outputDir = path.join(process.cwd(), 'public', 'pieces', fileName, difficulty);
  fs.mkdirSync(outputDir, { recursive: true });

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseCenterX = col * basePieceWidth + basePieceWidth / 2;
      const baseCenterY = row * basePieceHeight + basePieceHeight / 2;

      const left = baseCenterX - standardWidth / 2;
      const top = baseCenterY - standardHeight / 2;

      const canvas = sharp({
        create: {
          width: standardWidth,
          height: standardHeight,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      });

      const extractLeft = Math.max(0, Math.floor(left));
      const extractTop = Math.max(0, Math.floor(top));
      const extractRight = Math.min(targetWidth, Math.floor(left + standardWidth));
      const extractBottom = Math.min(targetHeight, Math.floor(top + standardHeight));

      let buffer: Buffer;
      if (extractLeft < extractRight && extractTop < extractBottom) {
        const extractedPart = await sharp(resizedImageBuffer)
          .extract({
            left: extractLeft,
            top: extractTop,
            width: extractRight - extractLeft,
            height: extractBottom - extractTop
          })
          .toBuffer();

        const offsetX = extractLeft - Math.floor(left);
        const offsetY = extractTop - Math.floor(top);

        buffer = await canvas
          .composite([{ input: extractedPart, top: offsetY, left: offsetX }])
          .webp()
          .toBuffer();
      } else {
        buffer = await canvas.webp().toBuffer();
      }
      const pieceName = `${row + 1}-${col + 1}.webp`;
      fs.writeFileSync(path.join(outputDir, pieceName), buffer);
    }
  }
}
