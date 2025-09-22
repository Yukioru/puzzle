export function selectPiecesToRemove(rows: number, cols: number, count: number): number[] {
  const getNeighbors = (index: number): number[] => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    const neighbors: number[] = [];
    
    if (row > 0) neighbors.push((row - 1) * cols + col);
    if (row < rows - 1) neighbors.push((row + 1) * cols + col);
    if (col > 0) neighbors.push(row * cols + (col - 1));
    if (col < cols - 1) neighbors.push(row * cols + (col + 1));
    
    return neighbors;
  };
  
  const candidates: number[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      const isCorner = (row === 0 || row === rows - 1) && (col === 0 || col === cols - 1);
      
      if (!isCorner) {
        candidates.push(index);
      }
    }
  }
  
  const startIndex = candidates[Math.floor(Math.random() * candidates.length)];
  
  const selected = new Set<number>([startIndex]);
  const queue = [startIndex];
  
  while (selected.size < count && queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = getNeighbors(current);
    
    for (let i = neighbors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }
    
    for (const neighbor of neighbors) {
      if (selected.size >= count) break;
      
      const neighborRow = Math.floor(neighbor / cols);
      const neighborCol = neighbor % cols;
      const isCorner = (neighborRow === 0 || neighborRow === rows - 1) && 
                      (neighborCol === 0 || neighborCol === cols - 1);
      
      if (!isCorner && !selected.has(neighbor)) {
        selected.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  return Array.from(selected);
}