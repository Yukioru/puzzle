'use client';

import { AspectRatio } from '../AspectRatio';
import styles from './JigsawBoard.module.css';
import { DroppableContainer } from '../DroppableContainer';
import { Difficulty, IJigsawPieceWithRender } from '~/types';
import { getDimensions } from '~/utils';

interface JigsawBoardProps {
  difficulty: Difficulty;
  pieces?: IJigsawPieceWithRender[];
}

export function JigsawBoard({ difficulty, pieces }: JigsawBoardProps) {
  const { rows, cols } = getDimensions(difficulty);
  return (
    <div className={styles.outer}>
      <div className={styles.frame}>
        <div
          className={styles.base}
          style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => {
            const piece = pieces?.[index];
            if (piece && piece.render) {
              return <DroppableContainer id={`cell-${index}`} key={index}>{piece.render}</DroppableContainer>;
            }
            return (
              <DroppableContainer id={`cell-${index}`} key={index}>
                <AspectRatio ratio={1} className={styles.cell} />
              </DroppableContainer>
            );
          })}
        </div>
      </div>
    </div>
  );
}