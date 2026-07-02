import { memo } from "react";
import clsx from "clsx";
import { IJigsawPiece } from "~/types";
import { JigsawPiece } from "../JigsawPiece";
import { SmartJigsawPiece } from "../SmartJigsawPiece";
import styles from "./JigsawGame.module.css";

export type PlayablePieceProps = {
  piece: IJigsawPiece;
  isDragging: boolean;
  isMatches: boolean;
  isOnBoard: boolean;
  onRotate: (pieceId: string, currentSides: NonNullable<IJigsawPiece['currentSides']>) => void;
}

const ZERO_COORDS = { x: 0, y: 0 };

export const PlayablePiece = memo(function PlayablePiece({
  piece,
  isDragging,
  isMatches,
  isOnBoard,
  onRotate,
}: PlayablePieceProps) {
  if (piece.isComplete) {
    return (
      <JigsawPiece
        image={piece.imageUrl}
        imageRotation={piece.imageRotation}
        initialSides={piece.initialSides}
        isShadow
      />
    );
  }

  return (
    <div className={styles.reserve}>
      <JigsawPiece
        isShadow
        image={piece.imageUrl}
        imageRotation={piece.imageRotation}
        initialSides={piece.initialSides}
        className={styles.reservePiece}
      />

      <SmartJigsawPiece
        isInteractable
        isDragging={isDragging}
        isMatches={isMatches}
        className={clsx({
          [styles.onBoard]: isOnBoard,
        })}
        id={piece.id}
        coords={piece.coords ?? ZERO_COORDS}
        initialSides={piece.initialSides}
        onClick={(newSides) => onRotate(piece.id, newSides)}
      >
        <JigsawPiece
          image={piece.imageUrl}
          imageRotation={piece.imageRotation}
          initialSides={piece.initialSides}
        />
      </SmartJigsawPiece>
    </div>
  );
});
