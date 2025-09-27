'use client';
import { Fragment } from 'react';
import { CSSProperties, ForwardedRef, forwardRef } from 'react';
import clsx from 'clsx';
import { AspectRatio } from '../AspectRatio';
import styles from './JigsawBoard.module.css';
import { DroppableContainer } from '../DroppableContainer';
import { IJigsawPieceWithRender } from '~/types';

interface JigsawBoardProps {
  rows: number;
  cols: number;
  pieces?: IJigsawPieceWithRender[];
  className?: string;
}

function JigsawBoard({ rows, cols, pieces, className }: JigsawBoardProps, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <div ref={ref} className={clsx(styles.frame, className)}>
      <div
        className={styles.base}
        style={{
          '--_cols': cols,
          '--_rows': rows,
        } as CSSProperties}
      >
        {pieces?.map((piece, index) => {
          if (piece && piece.render) {
            return <Fragment key={index}>{piece.render}</Fragment>;
          }
          return (
            <DroppableContainer id={piece.id} key={index}>
              <AspectRatio ratio={1} />
            </DroppableContainer>
          );
        })}
      </div>
    </div>
  );
}

export default forwardRef(JigsawBoard);