'use client';
import { JigsawBoard } from "~/components/JigsawBoard";
import { JigsawPiece } from "~/components/JigsawPiece";
import { SmartJigsawPiece } from "~/components/SmartJigsawPiece";
import { getDimensions, generateInitialPieces } from "~/utils";
import { Difficulty } from "~/types";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import hsr from '~/assets/images/hsr.png';

export default function DemoBoards() {
  const difficulty: Difficulty = 'easy';
  const boardSize = getDimensions(difficulty);
  const initialPieces = generateInitialPieces(boardSize.rows, boardSize.cols);

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

  // Преобразуем IJigsawPiece[] в IJigsawPieceWithRender[] для JigsawBoard
  const boardPieces = initialPieces.map(piece => ({
    id: piece.id,
    sides: piece.sides,
    render: (
      <SmartJigsawPiece key={piece.id} id={piece.id} initialSides={piece.sides}>
        <JigsawPiece image={hsr.src} sides={piece.sides} />
      </SmartJigsawPiece>
    )
  }));

  return (
    <DndContext id="demo-boards" sensors={sensors}>
      <>
        <div style={{ padding: '30px', width: 480 }}>
          <JigsawBoard
            difficulty={difficulty}
            pieces={boardPieces}
          />   
        </div>
        <div style={{ padding: '30px', width: 720 }}>
          <JigsawBoard
            difficulty={difficulty}
            pieces={boardPieces}
          />   
        </div>
        <div style={{ padding: '30px', width: 1200 }}>
          <JigsawBoard
            difficulty={difficulty}
            pieces={boardPieces}
          />   
        </div>
        <div style={{ padding: '30px', width: 1600 }}>
          <JigsawBoard
            difficulty={difficulty}
            pieces={boardPieces}
          />   
        </div>
      </>
    </DndContext>
  );
}
