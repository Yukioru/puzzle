import path from "node:path";
import fs from "node:fs";
import { sliceImageBySize } from "./sliceImageBySize";

const boardsDir = path.join(process.cwd(), "public", "boards");
const difficulties = ["easy", "medium", "hard"] as const;

async function generatePieces() {
  const piecesDir = path.join(process.cwd(), "public", "pieces");
  if (fs.existsSync(piecesDir)) {
    // Если папка уже есть — ничего не делаем
    return;
  }
  console.log("🧩 Генерация фрагментов пазлов...");
  const files = fs.readdirSync(boardsDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log("❌ Нет изображений в public/boards");
    return;
  }
  const tasks = files.flatMap(file =>
    difficulties.map(difficulty => {
      const imagePath = path.join(boardsDir, file);
      return sliceImageBySize(imagePath, difficulty);
    })
  );
  await Promise.allSettled(tasks);
  console.log("✅ Фрагменты пазлов успешно сгенерированы!");
}

generatePieces();
