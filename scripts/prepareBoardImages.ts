import path from "node:path";
import fs from "node:fs";
import { sliceImageBySize } from "./sliceImageBySize";
import { convertToOutline } from "./convertToOutline";
import { extractBoardPalette } from "./extractBoardPalette";
import { generateProfilesJson } from "./generateProfilesJson";

const boardsDir = path.join(process.cwd(), "public", "boards");
const outlineDir = path.join(process.cwd(), "public", "boards", "outline");
const palettesPath = path.join(process.cwd(), "public", "palettes.json");
const difficulties = ["easy", "medium", "hard"] as const;

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateOutline() {
  if (fs.existsSync(outlineDir)) {
    // Если папка уже есть — ничего не делаем
    return;
  }
  console.log("🧩 Генерация контуров изображений...");
  const allFiles = fs.readdirSync(boardsDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  const files = allFiles.filter(file => !file.includes("/"));

  if (files.length === 0) {
    console.log("❌ Нет изображений в public/boards");
    return;
  }

  ensureDirExists(outlineDir);

  const tasks = files.flatMap(file => {
    const imagePath = path.join(boardsDir, file);
    return convertToOutline(imagePath, `${outlineDir}/${file}`, {
      paper: { r: 245, g: 236, b: 200 },
      line: { r: 90, g: 80, b: 70 },
      threshold: 145,
      noiseStrength: 0.3,
      lineOpacity: 0.35 // едва заметные линии
    }).catch(err => {
      console.error("Ошибка обработки:", err);
      process.exit(1);
    });
  });
  await Promise.allSettled(tasks);
  console.log("✅ Контуры изображений успешно сгенерированы!");
}

async function generatePieces(inputDir: string, piecesDir: string) {
  if (fs.existsSync(piecesDir)) {
    // Если папка уже есть — ничего не делаем
    return;
  }
  console.log(`🧩 Генерация фрагментов пазлов для ${inputDir}...`);
  const files = fs.readdirSync(inputDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log(`❌ Нет изображений в ${inputDir}`);
    return;
  }

  ensureDirExists(piecesDir);

  const tasks = files.flatMap(file =>
    difficulties.map(difficulty => {
      const imagePath = path.join(inputDir, file);
      return sliceImageBySize(imagePath, difficulty, piecesDir);
    })
  );
  await Promise.allSettled(tasks);
  console.log("✅ Фрагменты пазлов успешно сгенерированы!");
}

async function generatePalettes() {
  console.log("🎨 Подготовка палитр досок...");
  const files = fs.readdirSync(boardsDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));

  if (files.length === 0) {
    console.log("❌ Нет изображений в public/boards");
    return;
  }

  const entries = await Promise.all(files.map(async file => {
    const imagePath = path.join(boardsDir, file);
    const boardId = path.basename(file, path.extname(file));

    return [
      boardId,
      await extractBoardPalette(imagePath),
    ] as const;
  }));

  fs.writeFileSync(palettesPath, JSON.stringify(Object.fromEntries(entries), null, 2));
  console.log("✅ Палитры досок успешно подготовлены!");
}

async function run() {
  generateProfilesJson();

  await generatePalettes();

  await generateOutline();

  await generatePieces(boardsDir, path.join(process.cwd(), "public", "pieces"));
  await generatePieces(outlineDir, path.join(process.cwd(), "public", "pieces", "outline"));
}

run();
