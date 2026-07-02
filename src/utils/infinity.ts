import type { InfinitySettings } from "~/types";

export const INFINITY_SETTINGS_KEYS = {
  enabled: 'infinity.enabled',
} as const;

export const DEFAULT_INFINITY_SETTINGS: InfinitySettings = {
  enabled: true,
};
