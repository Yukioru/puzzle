'use client';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { AspectRatio } from '../AspectRatio';
import styles from './JigsawBoard.module.css';
import { DroppableContainer } from '../DroppableContainer';
import { IJigsawPieceWithRender } from '~/types';
import { CSSProperties, ForwardedRef, forwardRef } from 'react';

interface JigsawBoardProps {
  rows: number;
  cols: number;
  pieces?: IJigsawPieceWithRender[];
}

function JigsawBoard({ rows, cols, pieces }: JigsawBoardProps, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <ViewTransition name="jigsaw-board">
      <div ref={ref} className={styles.frame}>
        <div
          className={styles.base}
          style={{
            '--_cols': cols,
            '--_rows': rows,
          } as CSSProperties}
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
    </ViewTransition>
  );
}

export default forwardRef(JigsawBoard);