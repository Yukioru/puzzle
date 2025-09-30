import sharp from "sharp";

/** Генерация светлого шумового слоя для имитации бумаги */
function generateNoise(width: number, height: number): Buffer {
  const data = Buffer.alloc(width * height); // 1 канал (grayscale)
  for (let i = 0; i < width * height; i++) {
    data[i] = 225 + Math.floor(Math.random() * 20); // узкий светлый диапазон
  }
  return data;
}

export async function convertToOutline(
  inputPath: string,
  outputPath: string,
  opts?: {
    paper?: { r: number; g: number; b: number };
    line?: { r: number; g: number; b: number };
    threshold?: number;
    noiseStrength?: number; // 0..1 — сила текстуры
    lineOpacity?: number;   // 0..1 — прозрачность линий
  }
) {
  const paperColor = opts?.paper ?? { r: 245, g: 236, b: 200 }; // тёплый беж
  const lineColor = opts?.line ?? { r: 90, g: 80, b: 70 };      // мягко-коричневые линии
  const thr = opts?.threshold ?? 145;
  const noiseStrength = Math.min(1, Math.max(0, opts?.noiseStrength ?? 0.3));
  const lineOpacity = Math.min(1, Math.max(0, opts?.lineOpacity ?? 0.4));

  // Ядро для выделения границ
  const edgeKernel = {
    width: 3,
    height: 3,
    kernel: [
      -1, -1, -1,
      -1,  8, -1,
      -1, -1, -1
    ]
  };

  // 1. Контуры (белые на чёрном)
  const edgesBuffer = await sharp(inputPath)
    .greyscale()
    .convolve(edgeKernel)
    .normalize()
    .median(1)
    .threshold(thr)
    .png()
    .toBuffer();

  // 2. Маска (альфа-канал для линий)
  const alphaMask = await sharp(edgesBuffer)
    .extractChannel(0)
    .png()
    .toBuffer();

  // 3. Размеры
  const { width, height } = await sharp(edgesBuffer).metadata();
  if (!width || !height) throw new Error("Не удалось определить размеры");

  // 4. Слой линий (цвет + альфа, ослабленные)
  const linesRGBA = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: lineColor
    }
  })
    .joinChannel(alphaMask)
    .modulate({ brightness: 2 }) // делаем линии светлее
    .png()
    .toBuffer();

  // 5. Базовый фон бумаги
  const paperBase = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: paperColor
    }
  }).png().toBuffer();

  // 6. Текстура бумаги (шум)
  const noiseRaw = generateNoise(width, height);
  let noise = sharp(noiseRaw, { raw: { width, height, channels: 1 } })
    .blur(0.8)
    .greyscale()
    .ensureAlpha();

  if (noiseStrength < 1) {
    noise = noise.modulate({ brightness: 0.9 + noiseStrength * 0.1 });
  }
  const noiseRGB = await noise.png().toBuffer();

  // 7. Композит: бумага + шум + линии
  await sharp(paperBase)
    .composite([
      { input: noiseRGB, blend: "multiply" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { input: linesRGBA, blend: "over", opacity: lineOpacity } as any
    ])
    .png()
    .toFile(outputPath);
}
