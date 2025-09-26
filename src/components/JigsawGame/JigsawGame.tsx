'use client';

import { DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { MdOutlineMoveDown } from "react-icons/md";
import { IJigsawGame } from "~/types";
import { JigsawBoard } from "../JigsawBoard";
import { SmartJigsawPiece } from "../SmartJigsawPiece";
import { JigsawPiece } from "../JigsawPiece";
import { Stock } from "../Stock";

import { getDimensions } from "~/utils/getDimentions";

import styles from './JigsawGame.module.css';
import { IconTextButton } from "../IconTextButton";
import { SystemBoard } from "../SystemBoard/SystemBoard";

type JigsawGameProps = IJigsawGame & HTMLProps<HTMLDivElement> & {
  showStock?: boolean;
  stockClassName?: string;
  stockWrapperClassName?: string;
  boardClassName?: string;
}

function resetPlayablePieces(playablePieces: IJigsawGame['playablePieces']) {
  return playablePieces.map(piece => ({
    ...piece,
    currentSides: piece.initialSides,
    isOnBoard: false,
    isMatches: false,
    isComplete: false,
    coords: { x: 0, y: 0 },
  }));
}

export default function JigsawGame({
  id,
  difficulty,
  pieces: initialBoardPieces,
  playablePieces: initialPlayablePieces,
  showStock,
  stockClassName,
  stockWrapperClassName,
  boardClassName,
  className,
  initialPieces,
  ...props
}: JigsawGameProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { rows, cols } = getDimensions(difficulty);
  const [playablePieces, setPlayablePieces] = useState(resetPlayablePieces(initialPlayablePieces));
  const [boardPieces, setBoardPieces] = useState(initialBoardPieces);


  const setPieceCompletion = useCallback((pieceId: string) => {
    const targetPiece = initialPieces.find(p => p.id === pieceId);

    setBoardPieces((prev) => {
      if (!targetPiece) return prev;
      return prev.map((piece) => {
        if (targetPiece.id === piece.id) {
          return {
            ...targetPiece,
            isEmpty: false,
          };
        }
        return piece;
      });
    });
    setPlayablePieces((prev) => {
      return prev.map((piece) => {
        if (piece.id === pieceId) {
          return {
            ...piece,
            isComplete: true,
          };
        }
        return piece;
      });
    });
  }, [initialPieces]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
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

  const boardPiecesWithRender = useMemo(() => boardPieces.map((piece) => {
    if (piece.isEmpty) {
      return {
        ...piece,
        render: null,
      };
    }
    
    return {
      ...piece,
      render: (
        <SmartJigsawPiece
          key={piece.id}
          id={piece.id}
          initialSides={piece.initialSides}
        >
          <JigsawPiece image={piece.image} initialSides={piece.initialSides} />
        </SmartJigsawPiece>
      )
    };
  }), [boardPieces]);

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
    const isSidesMatch = JSON.stringify(currentSides) === JSON.stringify(targetCell?.initialSides);

    return isOverTargetCell && isSidesMatch;
  }, [initialPieces]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const currentIsOnBoard = isOnBoard(event);
    const pieceId = String(event.active.id);
    const currentSides = playablePieces.find(p => p.id === pieceId)?.currentSides;

    const currentIsComplete = currentIsOnBoard && isMatches({
      pieceId,
      currentSides,
      cellOver: event.over,
    });

    if (currentIsComplete) {
      setPieceCompletion(pieceId);
      return;
    }

    setPlayablePieces((prev) => 
      prev.map(piece => {
        if (piece.id === pieceId) {
          return {
            ...piece,
            coords: {
              x: piece.coords.x + event.delta.x,
              y: piece.coords.y + event.delta.y,
            },
            isOnBoard: currentIsOnBoard,
            isMatches: false,
          };
        }
        return piece;
      })
    );

  }, [isOnBoard, isMatches, setPieceCompletion, playablePieces]);

  const handlePieceRotate = useCallback((pieceId: string, currentSides: [number, number, number, number]) => {
    const playablePiece = playablePieces.find(p => p.id === pieceId);
    if (!playablePiece) return;

    const currentIsComplete = playablePiece.isOnBoard && isMatches({
      pieceId,
      currentSides,
      cellOver: playablePiece.cellOver,
    });

    setPlayablePieces((prev) => 
      prev.map(piece => {
        if (piece.id === pieceId) {
          return {
            ...piece,
            currentSides,
            isMatches: false,
          };
        }
        return piece;
      })
    );

    
    if (currentIsComplete) {
      setTimeout(() => {
        setPieceCompletion(pieceId);
      }, 300);
    }

  }, [isMatches, setPieceCompletion, playablePieces]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const currentIsOnBoard = isOnBoard(event);
    const pieceId = String(event.active.id);

    setPlayablePieces((prev) => 
      prev.map(piece => {
        if (piece.id === pieceId) {
          const currentIsMatches = currentIsOnBoard && isMatches({
            pieceId,
            currentSides: piece.currentSides,
            cellOver: event.over,
          });
          return {
            ...piece,
            isOnBoard: currentIsOnBoard,
            isMatches: Boolean(currentIsMatches),
            cellOver: event.over,
          };
        }
        return piece;
      })
    );
  }, [isOnBoard, isMatches]);

  const handleReset = useCallback(() => {
    setPlayablePieces(resetPlayablePieces(initialPlayablePieces));
    setBoardPieces(initialBoardPieces);
  }, [initialPlayablePieces, initialBoardPieces]);

  const gameIsComplete = useMemo(() => {
    return boardPieces.every(piece => !piece.isEmpty);
  }, [boardPieces]);


  useEffect(() => {
    console.log('Game is complete:', gameIsComplete);
  }, [gameIsComplete]);


  return (
    <div ref={baseRef} className={clsx(styles.base, className)} {...props}>
      <DndContext
        id={id}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <SystemBoard className={boardClassName}>
          <JigsawBoard
            ref={boardRef}
            rows={rows}
            cols={cols}
            pieces={boardPiecesWithRender}
          />
        </SystemBoard>
        {showStock && (
          <div className={clsx(styles.stock, stockWrapperClassName)}>
            <Stock
              className={stockClassName}
              footer={(
                <IconTextButton
                  size="large"
                  className={styles.resetButton}
                  onClick={handleReset}
                  icon={<MdOutlineMoveDown />}
                >
                  Вернуть фрагменты
                </IconTextButton>
              )}
            >
              {playablePieces.map(piece => {
                if (piece?.isComplete) {
                  return (
                    <JigsawPiece
                      key={piece.id}
                      image={piece.image}
                      initialSides={piece.initialSides}
                      isShadow
                    />
                  );
                }

                return (
                  <div key={piece.id} className={styles.reserve}>
                    <JigsawPiece
                      isShadow image={piece.image}
                      initialSides={piece.initialSides}
                      className={styles.reservePiece}
                    />

                    <SmartJigsawPiece
                      isInteractable
                      isMatches={piece?.isMatches}
                      className={clsx({
                        [styles.onBoard]: piece?.isOnBoard,
                      })}
                      key={piece.id}
                      id={piece.id}
                      coords={{
                        x: piece.coords?.x || 0,
                        y: piece.coords?.y || 0,
                      }}
                      initialSides={piece.initialSides}
                      onClick={(newSides) => handlePieceRotate(piece.id, newSides)}
                    >
                      <JigsawPiece
                        image={piece.image}
                        initialSides={piece.initialSides}
                      />
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
