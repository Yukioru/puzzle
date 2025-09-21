'use client';

import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { IJigsawGame } from "~/types";
import { JigsawBoard } from "../JigsawBoard";
import { SmartJigsawPiece } from "../SmartJigsawPiece";
import { JigsawPiece } from "../JigsawPiece";
import { Stock } from "../Stock";

import hsr from '~/assets/images/hsr.png'

export function JigsawGame({ id, difficulty, pieces, playablePieces }: IJigsawGame) {

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

  const boardPieces = pieces.map((piece, index) => {
    if (!piece) {
      return {
        id: `empty-${index}`,
        sides: [0, 0, 0, 0] as [number, number, number, number],
        render: null
      };
    }
    
    return {
      id: piece.id,
      sides: piece.sides,
      render: (
        <SmartJigsawPiece
          key={piece.id}
          id={piece.id}
          initialSides={piece.sides}
        >
          <JigsawPiece image={hsr} sides={piece.sides} />
        </SmartJigsawPiece>
      )
    };
  });

  return (
    <DndContext id={id} sensors={sensors}>
      <div>
        <JigsawBoard
          difficulty={difficulty}
          pieces={boardPieces}
        />
      </div>
      <div>
        <Stock>
          {playablePieces.map(piece => (
            <SmartJigsawPiece
              isInteractable
              key={piece.id}
              id={piece.id}
              initialSides={piece.sides}
              onClick={(newSides) => handlePieceRotate(piece.id, newSides)}
            >
              <JigsawPiece image={hsr} sides={piece.sides} />
            </SmartJigsawPiece>
          ))}
        </Stock>
      </div>
    </DndContext>
  );
}