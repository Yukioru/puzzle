import Image, { ImageProps } from 'next/image';
import styles from './JigsawPuzzle.module.css';
import { ForwardedRef, forwardRef } from 'react';
import { AspectRatio } from '../AspectRatio';

interface JigsawPuzzleProps {
  image: ImageProps['src'];
  sides: number[];
  // Для реального паззла - позиция этого кусочка в общей картинке
  imagePosition?: {
    x: number; // позиция по X в процентах от общего изображения
    y: number; // позиция по Y в процентах от общего изображения
    totalWidth: number; // общая ширина паззла в кусочках
    totalHeight: number; // общая высота паззла в кусочках
  };
}

// Функция для генерации clip-path на основе массива sides
function generateClipPath(sides: number[]): string {
  const [top, right, bottom, left] = sides;
  
  // Размеры выступов (в процентах от увеличенного контейнера)
  const knobSize = 30; // размер выступа
  const knobDepth = 20; // глубина выступа
  
  // Коэффициент для пересчета координат в увеличенном контейнере
  // Контейнер увеличен на knobDepth*2, базовая область смещена на knobDepth
  const scale = 100 / (100 + knobDepth * 2);
  const offset = knobDepth / (100 + knobDepth * 2) * 100;
  
  // Пересчитываем координаты для увеличенного контейнера
  const baseLeft = offset;
  const baseRight = offset + 100 * scale;
  const baseTop = offset;
  const baseBottom = offset + 100 * scale;
  const center = offset + 50 * scale;
  const knobSizeScaled = knobSize * scale / 2;
  const knobDepthScaled = knobDepth * scale;
  
  let path = 'polygon(';
  const points: string[] = [];
  
  // Верхняя сторона
  if (top === 0) {
    // Плоская сторона
    points.push(`${baseLeft}% ${baseTop}%`, `${baseRight}% ${baseTop}%`);
  } else if (top === 1) {
    // Выступ наружу
    points.push(
      `${baseLeft}% ${baseTop}%`,
      `${center - knobSizeScaled}% ${baseTop}%`,
      `${center - knobSizeScaled}% ${baseTop - knobDepthScaled}%`,
      `${center + knobSizeScaled}% ${baseTop - knobDepthScaled}%`,
      `${center + knobSizeScaled}% ${baseTop}%`,
      `${baseRight}% ${baseTop}%`
    );
  } else {
    // Выступ внутрь
    points.push(
      `${baseLeft}% ${baseTop}%`,
      `${center - knobSizeScaled}% ${baseTop}%`,
      `${center - knobSizeScaled}% ${baseTop + knobDepthScaled}%`,
      `${center + knobSizeScaled}% ${baseTop + knobDepthScaled}%`,
      `${center + knobSizeScaled}% ${baseTop}%`,
      `${baseRight}% ${baseTop}%`
    );
  }
  
  // Правая сторона
  if (right === 0) {
    points.push(`${baseRight}% ${baseBottom}%`);
  } else if (right === 1) {
    // Выступ наружу
    points.push(
      `${baseRight}% ${center - knobSizeScaled}%`,
      `${baseRight + knobDepthScaled}% ${center - knobSizeScaled}%`,
      `${baseRight + knobDepthScaled}% ${center + knobSizeScaled}%`,
      `${baseRight}% ${center + knobSizeScaled}%`,
      `${baseRight}% ${baseBottom}%`
    );
  } else {
    // Выступ внутрь
    points.push(
      `${baseRight}% ${center - knobSizeScaled}%`,
      `${baseRight - knobDepthScaled}% ${center - knobSizeScaled}%`,
      `${baseRight - knobDepthScaled}% ${center + knobSizeScaled}%`,
      `${baseRight}% ${center + knobSizeScaled}%`,
      `${baseRight}% ${baseBottom}%`
    );
  }
  
  // Нижняя сторона
  if (bottom === 0) {
    points.push(`${baseLeft}% ${baseBottom}%`);
  } else if (bottom === 1) {
    // Выступ наружу
    points.push(
      `${center + knobSizeScaled}% ${baseBottom}%`,
      `${center + knobSizeScaled}% ${baseBottom + knobDepthScaled}%`,
      `${center - knobSizeScaled}% ${baseBottom + knobDepthScaled}%`,
      `${center - knobSizeScaled}% ${baseBottom}%`,
      `${baseLeft}% ${baseBottom}%`
    );
  } else {
    // Выступ внутрь
    points.push(
      `${center + knobSizeScaled}% ${baseBottom}%`,
      `${center + knobSizeScaled}% ${baseBottom - knobDepthScaled}%`,
      `${center - knobSizeScaled}% ${baseBottom - knobDepthScaled}%`,
      `${center - knobSizeScaled}% ${baseBottom}%`,
      `${baseLeft}% ${baseBottom}%`
    );
  }
  
  // Левая сторона
  if (left === 0) {
    // Плоская сторона - возвращаемся к началу
  } else if (left === 1) {
    // Выступ наружу
    points.push(
      `${baseLeft}% ${center + knobSizeScaled}%`,
      `${baseLeft - knobDepthScaled}% ${center + knobSizeScaled}%`,
      `${baseLeft - knobDepthScaled}% ${center - knobSizeScaled}%`,
      `${baseLeft}% ${center - knobSizeScaled}%`
    );
  } else {
    // Выступ внутрь
    points.push(
      `${baseLeft}% ${center + knobSizeScaled}%`,
      `${baseLeft + knobDepthScaled}% ${center + knobSizeScaled}%`,
      `${baseLeft + knobDepthScaled}% ${center - knobSizeScaled}%`,
      `${baseLeft}% ${center - knobSizeScaled}%`
    );
  }
  
  path += points.join(', ') + ')';
  return path;
}

// Sides - top, right, bottom, left
// 0 = flat
// 1 = out
// -1 = in
// Example: [0, 1, -1, 0] = top flat, right out, bottom in, left flat
// Example: [1, -1, 1, -1] = top out, right in, bottom out, left in
// Example: [-1, 1, -1, 1] = top in, right out, bottom in, left out
// Example: [0, 0, 0, 0] = all flat (edge piece)

function JigsawPuzzle({ image, sides, imagePosition }: JigsawPuzzleProps, ref: ForwardedRef<HTMLDivElement>) {
  const clipPath = generateClipPath(sides);
  
  const knobDepth = 12; // должен совпадать с knobDepth в generateClipPath
  
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
        ref={ref} 
        className={styles.base}
        style={{
          clipPath: clipPath,
          // Увеличиваем размер для размещения выступов, но выходим за границы контейнера
          width: `calc(100% + ${knobDepth * 2}px)`,
          height: `calc(100% + ${knobDepth * 2}px)`,
          // Центрируем, чтобы базовая область совпадала с контейнером AspectRatio
          transform: `translate(-${knobDepth}px, -${knobDepth}px)`,
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

export default forwardRef(JigsawPuzzle);