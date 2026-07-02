'use client';

import { CSSProperties, MouseEvent, PointerEvent, PropsWithChildren, useCallback, useRef, useState } from "react";
import styles from './SmartJigsawPiece.module.css';
import { IJigsawPiece } from "~/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";

interface SmartJigsawPieceProps {
  id: IJigsawPiece['id'];
  initialSides: IJigsawPiece['initialSides'];
  onClick?: (newSides: IJigsawPiece['initialSides'], event: MouseEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>) => void;
  isInteractable?: boolean;
  isMatches?: boolean;
  isDragging?: boolean;
  coords?: {
    x: number;
    y: number;
  };
  className?: string;
}

const TAP_MOVE_TOLERANCE = 8;

export function SmartJigsawPiece({
  id,
  initialSides,
  onClick,
  children,
  coords,
  isInteractable = false,
  isMatches = false,
  isDragging = false,
  className
}: PropsWithChildren<SmartJigsawPieceProps>) {
  const [rotation, setRotation] = useState(0);
  const touchTapRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const suppressNextClickRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ 
    id,
    disabled: !isInteractable
  });

  const rotatePiece = useCallback((event: MouseEvent<HTMLDivElement> | PointerEvent<HTMLDivElement>) => {
    if (isDragging || !isInteractable) {
      return;
    }

    const newRotation = Math.round(rotation + 90);
    setRotation(newRotation);
    const times = (newRotation % 360) / 90;
    const newSides: IJigsawPiece['initialSides'] = [
      initialSides[(0 - times + 4) % 4],
      initialSides[(1 - times + 4) % 4],
      initialSides[(2 - times + 4) % 4],
      initialSides[(3 - times + 4) % 4],
    ];
    onClick?.(newSides, event);
  }, [onClick, rotation, initialSides, isDragging, isInteractable]);

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    rotatePiece(event);
  }, [rotatePiece]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') {
      return;
    }

    touchTapRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const touchTap = touchTapRef.current;
    touchTapRef.current = null;

    if (!touchTap || touchTap.pointerId !== event.pointerId || event.pointerType === 'mouse') {
      return;
    }

    const distance = Math.hypot(event.clientX - touchTap.x, event.clientY - touchTap.y);
    if (distance > TAP_MOVE_TOLERANCE) {
      return;
    }

    suppressNextClickRef.current = true;
    window.setTimeout(() => {
      suppressNextClickRef.current = false;
    }, 500);
    rotatePiece(event);
  }, [rotatePiece]);

  const handlePointerCancel = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (touchTapRef.current?.pointerId === event.pointerId) {
      touchTapRef.current = null;
    }
  }, []);
 
  const coordsStyle: CSSProperties = {};
  if (coords) {
    coordsStyle.left = coords.x;
    coordsStyle.top = coords.y;
  }

  return (
    <div
      ref={setNodeRef}
      {...(isInteractable ? listeners : {})}
      {...(isInteractable ? attributes : {})}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      className={clsx(styles.base, {
        [styles.interactable]: isInteractable,
        [styles.dragging]: isDragging,
        [styles.matches]: isMatches,
      }, className)}
      style={{
        transform: CSS.Translate.toString(transform),
        ...coordsStyle,
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
