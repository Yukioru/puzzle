'use client';

import { DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, MouseSensor, TouchSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { IJigsawGame } from "~/types";
import { JigsawBoard } from "../JigsawBoard";
import { SmartJigsawPiece } from "../SmartJigsawPiece";
import { JigsawPiece } from "../JigsawPiece";
import { Stock } from "../Stock";

import { getDimensions } from "~/utils/getDimentions";
import { HTMLProps, PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from './JigsawGame.module.css';
import clsx from "clsx";

type JigsawGameProps = IJigsawGame & HTMLProps<HTMLDivElement> & {
  showStock?: boolean;
}

interface PiecePosition {
  x: number;
  y: number;
  isOnBoard?: boolean;
  isMatches?: boolean;
  isComplete?: boolean;
  currentSides?: [number, number, number, number];
}

function generateDefaultPiecesPosition(pieces: IJigsawGame['pieces']) {
  const positions: Record<string, PiecePosition> = {};
  pieces.forEach((piece) => {
    if (piece) {
      positions[piece.id] = {
        x: 0,
        y: 0,
        isOnBoard: false,
        isMatches: false,
        isComplete: false,
        currentSides: piece.sides, // Изначально текущие стороны равны исходным
      };
    }
  });
  
  return positions;
}

function SystemBoard({ children }: PropsWithChildren) {
  const { setNodeRef } = useDroppable({
    id: 'system-board',
  });

  return (
    <div ref={setNodeRef} className={styles.board}>
      {children}
    </div>
  )
}

export default function JigsawGame({
  id,
  difficulty,
  pieces,
  playablePieces,
  showStock,
  className,
  initialPieces,
  ...props
}: JigsawGameProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { rows, cols } = getDimensions(difficulty);
  const [piecesPosition, setPiecesPosition] = useState(generateDefaultPiecesPosition(playablePieces));

  const handlePieceRotate = useCallback((pieceId: string, newSides: [number, number, number, number]) => {
    console.log('Piece rotated:', pieceId, newSides);
    
    setPiecesPosition((prev) => {
      const currentState = prev[pieceId];
      
      return {
        ...prev,
        [pieceId]: {
          ...currentState,
          currentSides: newSides, // Сохраняем текущие повернутые стороны
          isMatches: false, // Сбрасываем isMatches при повороте
          isComplete: false, // Также сбрасываем isComplete
        },
      };
    });
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    if (!boardRef.current) return;

    const el = boardRef.current;

    const compute = () => {
      const cs = getComputedStyle(el);
      const gapX = parseFloat(cs.columnGap) || 0;
      const width = el.clientWidth;
      const pieceByWidth = (width - gapX * (cols - 1)) / cols;
      const cornerSize = parseFloat(cs.getPropertyValue('--corner')) || 0;
      const cornerInPx = cornerSize * parseFloat(getComputedStyle(document.documentElement).fontSize) || 0;
      const maxTotalHeight = window.innerHeight - (cornerInPx * 2);
      const pieceByHeight = maxTotalHeight / rows;
      const piece = Math.floor(Math.min(pieceByWidth, pieceByHeight));
      
      if (baseRef.current && Number.isFinite(piece) && piece > 0) {
        baseRef.current.style.setProperty('--piece-size', `${piece - 1}px`);
      }
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);

    const mq = window.matchMedia("(resolution: 1dppx)");
    mq.addEventListener?.("change", compute);

    window.addEventListener("orientationchange", compute);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      mq.removeEventListener?.("change", compute);
      window.removeEventListener("orientationchange", compute);
      window.removeEventListener("resize", compute);
    };
  }, [cols, rows]);

  const boardPieces = useMemo(() => pieces.map((piece) => {
    if (!piece.image) {
      return {
        ...piece,
        render: null,
      };
    }
    
    return {
      id: piece.id,
      sides: piece.sides,
      image: piece.image,
      render: (
        <SmartJigsawPiece
          key={piece.id}
          id={piece.id}
          initialSides={piece.sides}
        >
          <JigsawPiece image={piece.image} sides={piece.sides} />
        </SmartJigsawPiece>
      )
    };
  }), [pieces]);

  const isOnBoard = useCallback((event: DragEndEvent | DragMoveEvent | DragOverEvent) => {
    return Boolean(event.collisions?.find(collision => collision.id === 'system-board'));
  }, []);

  const isMatches = useCallback(({
    pieceId,
    currentSides,
    cellOver,
  }: {
    pieceId: string,
    currentSides?: [number, number, number, number],
    cellOver?: DragOverEvent['over'],
  }) => {
    if (!pieceId || !currentSides) return false;

    const targetCell = initialPieces.find(piece => piece.id === pieceId);
    const isOverTargetCell = targetCell && targetCell.id === cellOver?.id && targetCell.id === pieceId;
    const isSidesMatch = JSON.stringify(currentSides) === JSON.stringify(targetCell?.sides);

    return isOverTargetCell && isSidesMatch;
  }, [initialPieces]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log('Drag ended:', event);
    const currentIsOnBoard = isOnBoard(event);
    const pieceId = String(event.active.id);

    setPiecesPosition((prev) => {
      const prevEl = prev[event.active.id];
      const currentSides = prevEl.currentSides;
      
      const currentIsMatches = currentIsOnBoard && isMatches({
        pieceId,
        currentSides,
        cellOver: event.over,
      });

      return {
        ...prev,
        [event.active.id]: {
          ...prevEl,
          x:  prevEl.x + event.delta.x,
          y: prevEl.y + event.delta.y,
          isOnBoard: currentIsOnBoard,
          isMatches: false,
          isComplete: currentIsMatches,
        },
      };
    });
  }, [isOnBoard, isMatches]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const currentIsOnBoard = isOnBoard(event);
    const pieceId = String(event.active.id);

    console.log('Target cell on drag over:', {
      myCell: pieceId,
      event,
    });

    setPiecesPosition((prev) => {
      const currentSides = prev[event.active.id]?.currentSides;
      const currentIsMatches = currentIsOnBoard && isMatches({
        pieceId,
        currentSides,
        cellOver: event.over,
      });
      return {
        ...prev,
        [event.active.id]: {
          ...prev[event.active.id],
          isOnBoard: currentIsOnBoard,
          isMatches: currentIsMatches,
        },
      };
    });
  }, [isOnBoard, isMatches]);

  const handleReset = useCallback(() => {
    setPiecesPosition(generateDefaultPiecesPosition(playablePieces));
  }, [playablePieces]);

  return (
    <div ref={baseRef} className={clsx(styles.base, className)} {...props}>
      <DndContext
        id={id}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SystemBoard>
          <JigsawBoard
            ref={boardRef}
            rows={rows}
            cols={cols}
            pieces={boardPieces}
          />
        </SystemBoard>
        {showStock && (
          <div className={styles.stock}>
            <Stock
              footer={(
                <button
                  className={styles.resetButton}
                  onClick={handleReset}
                >
                  Вернуть фрагменты
                </button>
              )}
            >
              {playablePieces.map(piece => {
                const pieceState = piecesPosition[piece.id];
                return (
                  <div className={styles.reserve} key={piece.id}>
                    <JigsawPiece isShadow image={piece.image} sides={piece.sides}className={styles.reservePiece} />

                    <SmartJigsawPiece
                      className={clsx({
                        [styles.onBoard]: pieceState?.isOnBoard,
                      })}
                      isMatches={pieceState?.isMatches}
                      isInteractable
                      key={piece.id}
                      id={piece.id}
                      coords={{
                        x: pieceState?.x || 0,
                        y: pieceState?.y || 0,
                      }}
                      initialSides={piece.sides}
                      onClick={(newSides) => handlePieceRotate(piece.id, newSides)}
                    >
                      <JigsawPiece image={piece.image} sides={piece.sides} />
                    </SmartJigsawPiece>
                  </div>
                );
              })}
            </Stock>
          </div>
        )}
      </DndContext>
    </div>
  );
}
