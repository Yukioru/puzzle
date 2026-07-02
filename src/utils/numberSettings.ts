export function coerceNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

export function normalizeNumber(value: number, fallback: number, min: number) {
  if (!Number.isFinite(value)) return fallback;

  return Math.max(min, value);
}

export function normalizeInteger(value: number, fallback: number, min: number) {
  return Math.round(normalizeNumber(value, fallback, min));
}

export function numberToSetting(value: number) {
  return String(value);
}

export function settingToNumber(value: string | undefined, fallback: number) {
  if (typeof value === 'undefined') return fallback;

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}
