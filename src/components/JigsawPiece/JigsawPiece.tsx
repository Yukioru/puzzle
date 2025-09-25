import type { CSSProperties, ForwardedRef, HTMLProps } from 'react';
import { forwardRef, useId } from 'react';
import { AspectRatio } from '../AspectRatio';
import { puzzlePolygon } from './utils';

import styles from './JigsawPiece.module.css';
import { IJigsawPiece } from '~/types';
import clsx from 'clsx';

export interface JigsawPieceProps extends HTMLProps<HTMLDivElement> {
  image: string;
  initialSides: IJigsawPiece['initialSides'];
  isShadow?: boolean;
}

// Sides - top, right, bottom, left
// 0 = flat
// 1 = out
// -1 = in
// Example: [0, 1, -1, 0] = top flat, right out, bottom in, left flat
// Example: [1, -1, 1, -1] = top out, right in, bottom out, left in
// Example: [-1, 1, -1, 1] = top in, right out, bottom in, left out
// Example: [0, 0, 0, 0] = all flat (edge piece)

const DEPTH = 24;

function JigsawPiece({
  image,
  initialSides,
  className,
  isShadow,
  ...props
}: JigsawPieceProps, ref: ForwardedRef<HTMLDivElement>) {
  const clipId = useId();
  const shapeId = useId();
  const svgPath = puzzlePolygon(initialSides, {
    depth: DEPTH,
    headWidth: 25,
    neckWidth: 18,
    neckLength: 50,
    edgeCurve: 3,
    samplesNeck: 32,
    samplesCap: 48,
    samplesEdge: 4,
    returnSvgPath: true,
  });

  return (
    <AspectRatio
      ref={ref}
      ratio={1}
      className={clsx(styles.outer, className)}
      {...props}
    >
      <div 
        className={clsx(styles.base, {
          [styles.shadow]: isShadow,
        })}
        style={{
          '--_depth': `${DEPTH}%`,
        } as CSSProperties}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
        >
          <defs>
            <path id={shapeId} d={svgPath} />
            <clipPath id={clipId}>
              <use xlinkHref={`#${shapeId}`} />
            </clipPath>
          </defs>
          {!isShadow && (
            <image
              href={image}
              height="100%"
              width="100%"
              clipPath={`url(#${clipId})`}
            />
          )}
          <use
            data-id="stroke"
            xlinkHref={`#${shapeId}`}
            clipPath={`url(#${clipId})`}
            fill="none"
            stroke="rgba(30, 39, 35, 0.4)" 
            strokeWidth="1"
            className={styles.stroke}
          />
        </svg>
      </div>
    </AspectRatio>
  );
}

export default forwardRef(JigsawPiece);