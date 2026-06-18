import fs from "node:fs";
import path from "node:path";
import { IJigsawPalette } from "~/types";

const fallbackPalette: IJigsawPalette = {
  base: "24 24 26",
  accents: ["166 143 120", "250 206 150", "201 78 78"],
};

let cachedPalettes: Record<string, IJigsawPalette> | null = null;
let cachedMtimeMs: number | null = null;

function readBoardPalettes() {
  const palettesPath = path.join(process.cwd(), "public", "boards", "palettes.json");

  try {
    const mtimeMs = fs.statSync(palettesPath).mtimeMs;

    if (cachedPalettes && cachedMtimeMs === mtimeMs) {
      return cachedPalettes;
    }

    const content = fs.readFileSync(palettesPath, "utf8");

    cachedPalettes = JSON.parse(content) as Record<string, IJigsawPalette>;
    cachedMtimeMs = mtimeMs;

    return cachedPalettes;
  } catch {
    cachedPalettes = {};
    cachedMtimeMs = null;
  }

  return cachedPalettes;
}

export function getBoardPalette(boardId: string): IJigsawPalette {
  return readBoardPalettes()[boardId] ?? fallbackPalette;
}
