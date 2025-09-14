'use client';

import { CSSProperties, MouseEvent, PropsWithChildren, useCallback, useState } from "react";
import styles from './SmartJigsawPiece.module.css';

interface SmartJigsawPieceProps {
  initialSides: [number, number, number, number];
  onClick?: (newSides: [number, number, number, number], event: MouseEvent<HTMLDivElement>) => void;
}

export function SmartJigsawPiece({ initialSides, onClick, children }: PropsWithChildren<SmartJigsawPieceProps>) {
  const [rotation, setRotation] = useState(0);

  const handleChange = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const newRotation = Math.round(rotation + 90);
    setRotation(newRotation);
    const times = (newRotation % 360)  / 90;
    const newSides: [number, number, number, number] = [
      initialSides[(0 - times + 4) % 4],
      initialSides[(1 - times + 4) % 4],
      initialSides[(2 - times + 4) % 4],
      initialSides[(3 - times + 4) % 4],
    ];
    onClick?.(newSides, event);
  }, [onClick, rotation, initialSides]);
  
  return (
    <div
      className={styles.base}
      style={{ '--_rotation': `${rotation}deg` } as CSSProperties}
      onClick={handleChange}
    >
      {children}
    </div>
  );
}