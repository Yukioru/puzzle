import type { CSSProperties, ForwardedRef, HTMLProps } from 'react';
import { forwardRef, useId, useMemo } from 'react';
import { AspectRatio } from '../AspectRatio';
import { puzzlePolygon } from './utils';

import styles from './JigsawPiece.module.css';
import { IJigsawPiece } from '~/types';

export interface JigsawPieceProps extends HTMLProps<HTMLDivElement> {
  image: string;
  sides: IJigsawPiece['sides'];
}

// Sides - top, right, bottom, left
// 0 = flat
// 1 = out
// -1 = in
// Example: [0, 1, -1, 0] = top flat, right out, bottom in, left flat
// Example: [1, -1, 1, -1] = top out, right in, bottom out, left in
// Example: [-1, 1, -1, 1] = top in, right out, bottom in, left out
// Example: [0, 0, 0, 0] = all flat (edge piece)

const DEPTH = 24

function JigsawPiece({
  image,
  sides,
  ...props
}: JigsawPieceProps, ref: ForwardedRef<HTMLDivElement>) {
  const clipId = useId();
  const clipPath = puzzlePolygon(sides, {
    depth: DEPTH,
    headWidth: 25,
    neckWidth: 18,
    neckLength: 50,
    edgeCurve: 3,
    samplesNeck: 32,
    samplesCap: 48,
    samplesEdge: 4,
  });
  
  const svgPath = useMemo(() => (
    clipPath
      .replace('polygon(', '')
      .replace(')', '')
      .split(', ')
      .map((point, index) => {
        const [x, y] = point.split(' ');
        const xNum = parseFloat(x.replace('%', ''));
        const yNum = parseFloat(y.replace('%', ''));
        return `${index === 0 ? 'M' : 'L'} ${xNum} ${yNum}`;
      })
      .join(' ') + ' Z'
  ), [clipPath]);

  return (
    <AspectRatio
      ref={ref}
      ratio={1}
      {...props}
    >
      <div 
        className={styles.base}
        style={{
          '--_depth': `${DEPTH}%`,
        } as CSSProperties}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <clipPath id={clipId}>
              <path d={svgPath} />
            </clipPath>
          </defs>
          <image href={image} height="128" width="128" clipPath={`url(#${clipId})`} />
          <path 
            d={svgPath}
            fill="none"
            stroke="rgba(30, 39, 35, 0.4)" 
            strokeWidth="1"
          />
        </svg>
      </div>
    </AspectRatio>
  );
}

export default forwardRef(JigsawPiece);