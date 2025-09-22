import sharp from "sharp";
import { IJigsawPiece } from "~/types";

export async function attachImageToPieces(
  fileBuffer: NonSharedBuffer,
  pieces: Partial<IJigsawPiece>[],
  boardSize: { rows: number, cols: number }
): Promise<IJigsawPiece[]> {
  const boardAspectRatio = boardSize.cols / boardSize.rows;
  const targetHeight = 1200;
  const targetWidth = Math.floor(targetHeight * boardAspectRatio);
  
  const resizedImageBuffer = await sharp(fileBuffer)
    .resize(targetWidth, targetHeight, { fit: 'cover' })
    .toBuffer();

  const basePieceWidth = Math.floor(targetWidth / boardSize.cols);
  const basePieceHeight = Math.floor(targetHeight / boardSize.rows);

  const OVERLAP_PERCENT = 24;
  const overlapX = Math.floor(basePieceWidth * OVERLAP_PERCENT / 100);
  const overlapY = Math.floor(basePieceHeight * OVERLAP_PERCENT / 100);

  const standardWidth = basePieceWidth + overlapX * 2;
  const standardHeight = basePieceHeight + overlapY * 2;

  return Promise.all(
    pieces.map(async (piece, index) => {
      const row = Math.floor(index / boardSize.cols);
      const col = index % boardSize.cols;

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

        const buffer = await canvas
          .composite([{
            input: extractedPart,
            top: offsetY,
            left: offsetX
          }])
          .jpeg()
          .toBuffer();

        return {
          ...piece,
          image: `data:image/jpeg;base64,${buffer.toString('base64')}`
        } as IJigsawPiece;
      }

      const buffer = await canvas.jpeg().toBuffer();
      return {
        ...piece,
        image: `data:image/jpeg;base64,${buffer.toString('base64')}`
      } as IJigsawPiece;
    })
  );
}