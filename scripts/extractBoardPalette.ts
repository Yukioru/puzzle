import sharp from "sharp";
import { IJigsawPalette } from "../src/types";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Hsl {
  h: number;
  s: number;
  l: number;
}

const fallbackPalette: IJigsawPalette = {
  base: "24 24 26",
  accents: ["166 143 120", "250 206 150", "78 166 108"],
};

function clampColor(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function formatRgb({ r, g, b }: Rgb) {
  return `${clampColor(r)} ${clampColor(g)} ${clampColor(b)}`;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: lightness };
  }

  const delta = max - min;
  const saturation = lightness > 0.5
    ? delta / (2 - max - min)
    : delta / (max + min);
  let hue = 0;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return {
    h: hue * 60,
    s: saturation,
    l: lightness,
  };
}

function mixRgb(colors: Rgb[]) {
  const color = colors.reduce<Rgb>((result, item) => ({
    r: result.r + item.r,
    g: result.g + item.g,
    b: result.b + item.b,
  }), { r: 0, g: 0, b: 0 });
  const count = Math.max(1, colors.length);

  return {
    r: color.r / count,
    g: color.g / count,
    b: color.b / count,
  };
}

function getHueDistance(a: number, b: number) {
  const distance = Math.abs(a - b);

  return Math.min(distance, 360 - distance);
}

function getBaseColor(colors: Rgb[]) {
  const average = mixRgb(colors);

  return {
    r: average.r * 0.34,
    g: average.g * 0.34,
    b: average.b * 0.34,
  };
}

function getAccentColors(colors: Rgb[]) {
  const candidates = colors
    .map((color) => {
      const hsl = rgbToHsl(color);

      return {
        color,
        hsl,
        score: hsl.s * (1 - Math.abs(hsl.l - 0.56)),
      };
    })
    .filter(({ hsl }) => hsl.s >= 0.18 && hsl.l >= 0.16 && hsl.l <= 0.84)
    .sort((a, b) => b.score - a.score);
  const accents: typeof candidates = [];

  for (const candidate of candidates) {
    const isDistinct = accents.every((accent) => getHueDistance(accent.hsl.h, candidate.hsl.h) >= 34);

    if (isDistinct) {
      accents.push(candidate);
    }

    if (accents.length === 3) break;
  }

  while (accents.length < 3 && candidates[accents.length]) {
    accents.push(candidates[accents.length]);
  }

  return accents.length > 0
    ? accents.map(({ color }) => color)
    : [mixRgb(colors)];
}

export async function extractBoardPalette(filePath: string): Promise<IJigsawPalette> {
  try {
    const { data, info } = await sharp(filePath)
      .resize(32, 32, { fit: "inside", withoutEnlargement: true })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const colors: Rgb[] = [];

    for (let index = 0; index < data.length; index += info.channels) {
      colors.push({
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
      });
    }

    const accentColors = getAccentColors(colors);

    return {
      base: formatRgb(getBaseColor(colors)),
      accents: [
        formatRgb(accentColors[0]),
        formatRgb(accentColors[1] ?? accentColors[0]),
        formatRgb(accentColors[2] ?? accentColors[0]),
      ],
    };
  } catch {
    return fallbackPalette;
  }
}
