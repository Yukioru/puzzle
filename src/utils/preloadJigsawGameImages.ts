import { IJigsawGame } from "~/types";

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = src;
  });
}

function getGameImageUrls(game: IJigsawGame) {
  const imageUrls = new Set<string>();
  const pieces = [...game.pieces, ...game.initialPieces, ...game.playablePieces];

  pieces.forEach((piece) => {
    imageUrls.add(piece.imageUrl);

    if (piece.isEmpty) {
      const imageFile = piece.imageUrl.split('/').pop();

      if (imageFile) {
        imageUrls.add(`/pieces/outline/${game.imageFileName}/${game.difficulty}/${imageFile}`);
      }
    }
  });

  return Array.from(imageUrls);
}

export async function preloadJigsawGameImages(game: IJigsawGame) {
  await Promise.all(getGameImageUrls(game).map(preloadImage));
}
