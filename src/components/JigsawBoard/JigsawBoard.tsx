'use client';

import { Fragment, ReactNode } from 'react';
import { AspectRatio } from '../AspectRatio';
import styles from './JigsawBoard.module.css';

interface JigsawBoardProps {
  difficulty: 'easy' | 'medium' | 'hard';
  pieces?: (ReactNode | null)[];
}

function getDimensions(difficulty: JigsawBoardProps['difficulty']) {
  switch (difficulty) {
    case 'hard':
      return { rows: 6, cols: 8 };
    case 'medium':
      return { rows: 5, cols: 7 };
    case 'easy':
    default:
      return { rows: 4, cols: 6 };
  }
}

export function JigsawBoard({ difficulty, pieces }: JigsawBoardProps) {
  const { rows, cols } = getDimensions(difficulty);
  return (
    <div
      className={styles.base}
      style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, index) => {
        const piece = pieces?.[index] ?? null;
        if (piece) {
          return <Fragment key={index}>{piece}</Fragment>;
        }
        return (
          <AspectRatio key={index} ratio={1} className={styles.cell} />
        );
      })}
    </div>
  );
}