'use client';

import { DndContext, DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { MdOutlineMoveDown } from "react-icons/md";
import { IJigsawGame, IJigsawGameCompleteInfo, IJigsawPiece } from "~/types";
import { JigsawBoard } from "../JigsawBoard";
import { SmartJigsawPiece } from "../SmartJigsawPiece";
import { JigsawPiece } from "../JigsawPiece";
import { Stock } from "../Stock";
import { PlayablePiece } from "./PlayablePiece";

import { getDimensions } from "~/utils/getDimentions";

import styles from './JigsawGame.module.css';
import { IconTextButton } from "../IconTextButton";
import { SystemBoard } from "../SystemBoard/SystemBoard";

type JigsawGameProps = IJigsawGame & HTMLProps<HTMLDivElement> & {
  showStock?: boolean;
  stockClassName?: string;
  stockWrapperClassName?: string;
  boardClassName?: string;
  boardFrameClassName?: string;
  dndId?: string;
  onComplete?: (gameInfo: IJigsawGameCompleteInfo) => void;
  onGameStateChange?: (gameState: IJigsawGame) => void;
}

type DragFeedback = {
  pieceId: string;
  isOnBoard: boolean;
  isMatches: boolean;
  cellOver: DragOverEvent['over'];
}

function serializePiece(piece: IJigsawPiece): IJigsawPiece {
  const { cellOver: _cellOver, ...rest } = piece;

  return rest;
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

function hydratePlayablePieces(playablePieces: IJigsawGame['playablePieces']) {
  return playablePieces.map(piece => ({
    ...piece,
    currentSides: piece.currentSides ?? piece.initialSides,
    isOnBoard: piece.isOnBoard ?? false,
    isMatches: piece.isMatches ?? false,
    isComplete: piece.isComplete ?? false,
    coords: piece.coords ?? { x: 0, y: 0 },
  }));
}

function sidesMatch(
  a?: IJigsawPiece['currentSides'],
  b?: IJigsawPiece['initialSides'],
) {
  return Boolean(
    a &&
    b &&
    a[0] === b[0] &&
    a[1] === b[1] &&
    a[2] === b[2] &&
    a[3] === b[3]
  );
}

export default function JigsawGame({
  id,
  imageFileName,
  difficulty,
  pieces: initialBoardPieces,
  playablePieces: initialPlayablePieces,
  showStock,
  stockClassName,
  stockWrapperClassName,
  boardClassName,
  boardFrameClassName,
  className,
  dndId,
  initialPieces,
  palette,
  shuffledBoardsIds,
  onComplete,
  onGameStateChange,
  ...props
}: JigsawGameProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const gameWasCompleteRef = useRef(false);
  const { rows, cols } = getDimensions(difficulty);
  const [playablePieces, setPlayablePieces] = useState(() => hydratePlayablePieces(initialPlayablePieces));
  const [boardPieces, setBoardPieces] = useState(initialBoardPieces);
  const [activePieceId, setActivePieceId] = useState<string | null>(null);
  const [dragFeedback, setDragFeedback] = useState<DragFeedback | null>(null);
  const playablePiecesRef = useRef(playablePieces);
  const initialPiecesById = useMemo(() => {
    return new Map(initialPieces.map(piece => [piece.id, piece]));
  }, [initialPieces]);

  useEffect(() => {
    playablePiecesRef.current = playablePieces;
  }, [playablePieces]);

  const currentGameState = useMemo<IJigsawGame>(() => ({
    id,
    imageFileName,
    shuffledBoardsIds,
    difficulty,
    palette,
    pieces: boardPieces.map(serializePiece),
    initialPieces: initialPieces.map(serializePiece),
    playablePieces: playablePieces.map(serializePiece),
  }), [
    boardPieces,
    difficulty,
    id,
    imageFileName,
    initialPieces,
    palette,
    playablePieces,
    shuffledBoardsIds,
  ]);

  useEffect(() => {
    onGameStateChange?.(currentGameState);
  }, [currentGameState, onGameStateChange]);


  const setPieceCompletion = useCallback((pieceId: string) => {
    const targetPiece = initialPiecesById.get(pieceId);

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
  }, [initialPiecesById]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 4
      },
    })
  );

  useEffect(() => {
    if (!boardRef.current || !baseRef.current) return;

    const board = boardRef.current;
    const base = baseRef.current;

    const compute = () => {
      const boardStyles = getComputedStyle(board);
      const baseStyles = getComputedStyle(base);
      const gapX = parseFloat(boardStyles.columnGap) || 0;
      const gapY = parseFloat(boardStyles.rowGap) || 0;
      const width = board.clientWidth;
      const pieceByWidth = (width - gapX * (cols - 1)) / cols;
      const maxHeight = parseFloat(baseStyles.maxHeight);
      const availableHeight = Number.isFinite(maxHeight) && maxHeight > 0
        ? maxHeight
        : window.innerHeight;
      const pieceByHeight = (availableHeight - gapY * (rows - 1)) / rows;
      const piece = Math.floor(Math.min(pieceByWidth, pieceByHeight));
      
      if (Number.isFinite(piece) && piece > 0) {
        base.style.setProperty('--piece-size', `${piece - 3}px`);
      }
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(board);
    ro.observe(base);

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
      const imageFile = piece.imageUrl.split('/').pop();
      const outlineImageUrl = `/pieces/outline/${imageFileName}/${difficulty}/${imageFile}`;
      return {
        ...piece,
        render: (
          <JigsawPiece
            key={piece.id}
            id={piece.id}
            image={outlineImageUrl}
            imageRotation={piece.imageRotation}
            initialSides={piece.initialSides}
          />
        ),
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
          <JigsawPiece
            image={piece.imageUrl}
            imageRotation={piece.imageRotation}
            initialSides={piece.initialSides}
          />
        </SmartJigsawPiece>
      )
    };
  }), [boardPieces, difficulty, imageFileName]);

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

    const targetCell = initialPiecesById.get(pieceId);
    const isOverTargetCell = targetCell && targetCell.id === cellOver?.id && targetCell.id === pieceId;

    return Boolean(isOverTargetCell && sidesMatch(currentSides, targetCell?.initialSides));
  }, [initialPiecesById]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActivePieceId(String(event.active.id));
  }, []);

  const handleDragCancel = useCallback(() => {
    setActivePieceId(null);
    setDragFeedback(null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const currentIsOnBoard = isOnBoard(event);
    const pieceId = String(event.active.id);
    const currentSides = playablePiecesRef.current.find(p => p.id === pieceId)?.currentSides;

    setActivePieceId(null);
    setDragFeedback(null);

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
              x: (piece.coords?.x ?? 0) + event.delta.x,
              y: (piece.coords?.y ?? 0) + event.delta.y,
            },
            isOnBoard: currentIsOnBoard,
            isMatches: false,
            cellOver: event.over,
          };
        }
        return piece;
      })
    );

  }, [isOnBoard, isMatches, setPieceCompletion]);

  const handlePieceRotate = useCallback((pieceId: string, currentSides: NonNullable<IJigsawPiece['currentSides']>) => {
    const playablePiece = playablePiecesRef.current.find(p => p.id === pieceId);
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

  }, [isMatches, setPieceCompletion]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const currentIsOnBoard = isOnBoard(event);
    const pieceId = String(event.active.id);
    const overId = event.over?.id;

    const activePiece = playablePiecesRef.current.find(piece => piece.id === pieceId);
    const currentIsMatches = currentIsOnBoard && isMatches({
      pieceId,
      currentSides: activePiece?.currentSides,
      cellOver: event.over,
    });

    setDragFeedback((prev) => {
      if (
        prev?.pieceId === pieceId &&
        prev.isOnBoard === currentIsOnBoard &&
        prev.isMatches === Boolean(currentIsMatches) &&
        prev.cellOver?.id === overId
      ) {
        return prev;
      }

      return {
        pieceId,
        isOnBoard: currentIsOnBoard,
        isMatches: Boolean(currentIsMatches),
        cellOver: event.over,
      };
    });
  }, [isOnBoard, isMatches]);

  const handleReset = useCallback(() => {
    setPlayablePieces(resetPlayablePieces(initialPlayablePieces));
    setBoardPieces(initialBoardPieces);
    setActivePieceId(null);
    setDragFeedback(null);
  }, [initialPlayablePieces, initialBoardPieces]);

  const gameIsComplete = useMemo(() => {
    return boardPieces.every(piece => !piece.isEmpty);
  }, [boardPieces]);


  useEffect(() => {
    if (!gameIsComplete) {
      gameWasCompleteRef.current = false;
      return;
    }

    if (gameWasCompleteRef.current) return;

    gameWasCompleteRef.current = true;
    onComplete?.({
      gameId: id,
      boardId: imageFileName,
      gameState: currentGameState,
    });
  }, [currentGameState, gameIsComplete, id, imageFileName, onComplete]);


  return (
    <div ref={baseRef} className={clsx(styles.base, className)} {...props}>
      <DndContext
        id={dndId ?? id}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        onDragOver={handleDragOver}
      >
        <SystemBoard className={boardClassName}>
          <JigsawBoard
            className={boardFrameClassName}
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
                const isActivePiece = activePieceId === piece.id;
                const activeDragFeedback = dragFeedback?.pieceId === piece.id ? dragFeedback : null;

                return (
                  <PlayablePiece
                    key={piece.id}
                    piece={piece}
                    isDragging={isActivePiece}
                    isMatches={activeDragFeedback?.isMatches ?? Boolean(piece.isMatches)}
                    isOnBoard={activeDragFeedback?.isOnBoard ?? Boolean(piece.isOnBoard)}
                    onRotate={handlePieceRotate}
                  />
                );
              })}
            </Stock>
          </div>
        )}
      </DndContext>
    </div>
  );
}
