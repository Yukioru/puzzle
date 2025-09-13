'use client';

import Image, { ImageProps } from 'next/image';
import styles from './JigsawPuzzle.module.css';
import { AspectRatio } from '../AspectRatio';
import { puzzlePolygon } from './utils';

interface JigsawPuzzleProps {
  image: ImageProps['src'];
  sides: [number, number, number, number]; // [top, right, bottom, left]
  // Для реального паззла - позиция этого кусочка в общей картинке
  imagePosition?: {
    x: number; // позиция по X в процентах от общего изображения
    y: number; // позиция по Y в процентах от общего изображения
    totalWidth: number; // общая ширина паззла в кусочках
    totalHeight: number; // общая высота паззла в кусочках
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

function JigsawPuzzle({ image, sides, imagePosition }: JigsawPuzzleProps) {
  const depth = 24;
  const clipPath = puzzlePolygon(sides, {
    headWidth: 25,   // уменьшаем размер головки
    neckWidth: 18,   // увеличиваем размер шейки для более плавного перехода
    neckLength: 50,  // увеличиваем длину шейки
    depth,
    edgeCurve: 3,   // пока оставляем прямые края, фокусируемся на выступах
    samplesNeck: 32, // еще больше точек на шейке
    samplesCap: 48,  // еще больше точек на головке
    samplesEdge: 4, // возвращаем минимум точек на краях
  });
  
  // Позиционирование изображения для реального паззла
  let imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };
  
  if (imagePosition) {
    // Для реального паззла - показываем правильную область изображения
    const { x, y, totalWidth, totalHeight } = imagePosition;
    imageStyle = {
      width: `${totalWidth * 100}%`,
      height: `${totalHeight * 100}%`,
      transform: `translate(-${x * 100}%, -${y * 100}%)`,
      objectPosition: '0 0',
    };
  }
  
  return (
    <AspectRatio ratio={1}>
      <div 
        className={styles.base}
        style={{
          clipPath,                            // << прямая передача path("…")
          width: `calc(100% + ${depth * 2}px)`,         // если depthTip=20px в твоих единицах
          height:`calc(100% + ${depth * 2}px)`,
          transform: `translate(-${depth}px, -${depth}px)`,
        }}
      >
        <Image 
          src={image} 
          alt="" 
          layout="fill"
          objectFit="cover"
          style={imageStyle}
        />
      </div>
    </AspectRatio>
  );
}

export default JigsawPuzzle;