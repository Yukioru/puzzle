'use client';

import { useDroppable } from "@dnd-kit/core";
import { PropsWithChildren } from "react";
import { AspectRatio } from "../AspectRatio";

interface DroppableContainerProps {
  id: string;
}

export function DroppableContainer({ id, children }: PropsWithChildren<DroppableContainerProps>) {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef} style={{ outline: isOver ? '2px solid blue' : 'none' }}>
      <AspectRatio ratio={1}>
        {children}
      </AspectRatio>
    </div>
  );
}