'use client';

import styles from './JigsawBoard.module.css';

interface JigsawBoardProps {
  difficulty: 'easy' | 'medium' | 'hard';
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

export function JigsawBoard({ difficulty }: JigsawBoardProps) {
  const { rows, cols } = getDimensions(difficulty);
  return (
    <div
      className={styles.base}
      style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {Array.from({ length: rows * cols }).map((_, index) => (
        <div key={index} className={styles.cell} />
      ))}
    </div>
  );
}