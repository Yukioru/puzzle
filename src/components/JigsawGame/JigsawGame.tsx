'use client';

import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { IJigsawGame } from "~/types";
import { JigsawBoard } from "../JigsawBoard";
import { SmartJigsawPiece } from "../SmartJigsawPiece";
import { JigsawPiece } from "../JigsawPiece";
import { Stock } from "../Stock";

import { getDimensions } from "~/utils/getDimentions";
import { HTMLProps, useCallback, useEffect, useMemo, useRef, useState } from "react";

import styles from './JigsawGame.module.css';
import clsx from "clsx";

type JigsawGameProps = IJigsawGame & HTMLProps<HTMLDivElement> & {
  showStock?: boolean;
}

interface PiecePosition {
  x: number;
  y: number;
}

function generateDefaultPiecesPosition(pieces: IJigsawGame['pieces']) {

  const positions: Record<string, PiecePosition> = {};
  pieces.forEach((piece) => {
    if (piece) {
      positions[piece.id] = {
        x: 0,
        y: 0
      };
    }
  });
  
  return positions;
}

export default function JigsawGame({
  id,
  difficulty,
  pieces,
  playablePieces,
  showStock,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initialPieces,
  ...props
}: JigsawGameProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const { rows, cols } = getDimensions(difficulty);
  const [piecesPosition, setPiecesPosition] = useState(generateDefaultPiecesPosition(playablePieces));

  const handlePieceRotate = (pieceId: string, newSides: unknown) => {
    console.log('Piece rotated:', pieceId, newSides);
  };

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

  const boardPieces = useMemo(() => pieces.map((piece, index) => {
    if (!piece) {
      return {
        id: `empty-${index}`,
        sides: [0, 0, 0, 0] as [number, number, number, number],
        render: null,
        image: '',
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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log('Drag ended:', event);
    setPiecesPosition((prev) => {
      const prevEl = prev[event.active.id];
      return {
        ...prev,
        [event.active.id]: {
          x:  prevEl.x + event.delta.x,
          y: prevEl.y + event.delta.y,
        },
      };
    });
  }, []);

  return (
    <div ref={baseRef} className={clsx(styles.base, className)} {...props}>
      <DndContext id={id} sensors={sensors} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          <JigsawBoard
            ref={boardRef}
            rows={rows}
            cols={cols}
            pieces={boardPieces}
          />
        </div>
        {showStock && (
          <div className={styles.stock}>
            <Stock>
              {playablePieces.map(piece => {
                const pieceCoords = piecesPosition[piece.id];
                return (
                  <div className={styles.reserve} key={piece.id}>
                    <SmartJigsawPiece
                      isInteractable
                      key={piece.id}
                      id={piece.id}
                      coords={pieceCoords}
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
