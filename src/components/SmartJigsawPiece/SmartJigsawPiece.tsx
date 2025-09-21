'use client';

import { CSSProperties, MouseEvent, PropsWithChildren, useCallback, useState } from "react";
import styles from './SmartJigsawPiece.module.css';
import { IJigsawPiece } from "~/types";
import { useDraggable, useDndMonitor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface SmartJigsawPieceProps {
  id: IJigsawPiece['id'];
  initialSides: IJigsawPiece['sides'];
  onClick?: (newSides: IJigsawPiece['sides'], event: MouseEvent<HTMLDivElement>) => void;
  isInteractable?: boolean;
}

export function SmartJigsawPiece({
  id,
  initialSides,
  onClick,
  children,
  isInteractable = false
}: PropsWithChildren<SmartJigsawPieceProps>) {
  const [rotation, setRotation] = useState(0);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ 
    id,
    disabled: !isInteractable
  });
  const [isDragging, setIsDragging] = useState(false);

  useDndMonitor({
    onDragStart(event) {
      if (event.active.id === id) {
        setIsDragging(true);
      }
    },
    onDragEnd() {
      setIsDragging(false);
    },
    onDragCancel() {
      setIsDragging(false);
    },
  });

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (isDragging || !isInteractable) {
      return;
    }

    const newRotation = Math.round(rotation + 90);
    setRotation(newRotation);
    const times = (newRotation % 360) / 90;
    const newSides: IJigsawPiece['sides'] = [
      initialSides[(0 - times + 4) % 4],
      initialSides[(1 - times + 4) % 4],
      initialSides[(2 - times + 4) % 4],
      initialSides[(3 - times + 4) % 4],
    ];
    onClick?.(newSides, event);
  }, [onClick, rotation, initialSides, isDragging, isInteractable]);
  
  return (
    <div
      ref={setNodeRef}
      {...(isInteractable ? listeners : {})}
      {...(isInteractable ? attributes : {})}
      onClick={handleClick}
      style={{
        cursor: isInteractable ? 'pointer' : 'default',
        transform: CSS.Translate.toString(transform),
      }}
    >
      <div
        className={styles.inner}
        style={{
          '--_rotation': `${rotation}deg`,
        } as CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}