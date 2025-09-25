'use client';

import { useDroppable } from "@dnd-kit/core";
import { PropsWithChildren } from "react";

interface DroppableContainerProps {
  id: string;
}

export function DroppableContainer({ id, children }: PropsWithChildren<DroppableContainerProps>) {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}