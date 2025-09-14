import Image, { ImageProps } from 'next/image';
import type { CSSProperties, ForwardedRef, HTMLProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { AspectRatio } from '../AspectRatio';
import { puzzlePolygon } from './utils';

import styles from './JigsawPiece.module.css';

export interface JigsawPieceProps extends HTMLProps<HTMLDivElement> {
  image: ImageProps['src'];
  sides: [number, number, number, number];
  imagePosition?: {
    x: number;
    y: number;
    totalWidth: number;
    totalHeight: number;
  };
}

// Sides - top, right, bottom, left
// 0 = flat
// 1 = out
// -1 = in
// Example: [0, 1, -1, 0] = top flat, right out, bottom in, left flat
// Example: [1, -1, 1, -1] = top out, right in, bottom out, left in
// Example: [-1, 1, -1, 1] = top in, right out, bottom in, left out
// Example: [0, 0, 0, 0] = all flat (edge piece)

function JigsawPiece({
  image,
  sides,
  imagePosition,
  ...props
}: JigsawPieceProps, ref: ForwardedRef<HTMLDivElement>) {
  const clipPath = puzzlePolygon(sides, {
    depth: 24,
    headWidth: 25,
    neckWidth: 18,
    neckLength: 50,
    edgeCurve: 3,
    samplesNeck: 32,
    samplesCap: 48,
    samplesEdge: 4,
  });
  
  let imageStyle: CSSProperties = {};
  if (imagePosition) {
    const { x, y, totalWidth, totalHeight } = imagePosition;
    imageStyle = {
      width: `${totalWidth * 100}%`,
      height: `${totalHeight * 100}%`,
      transform: `translate(-${x * 100}%, -${y * 100}%)`,
      objectPosition: '0 0',
    };
  }
  
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
          '--_depth': `clamp(4px, 7.5%, 16px)`,
          '--_path': clipPath as string,
        } as CSSProperties}
      >
        <Image 
          src={image} 
          alt="" 
          layout="fill"
          objectFit="cover"
          style={imageStyle}
          className={styles.image}
        />
        <div className={styles.stroke}>
          <svg 
            className={styles.strokeSvg} 
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path 
              d={svgPath}
              fill="none" 
              stroke="rgba(51, 53, 63, 0.5)" 
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>
    </AspectRatio>
  );
}

export default forwardRef(JigsawPiece);