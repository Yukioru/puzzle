import type { BoardSettings } from "~/types";

export const BOARD_SETTINGS_KEYS = {
  matchProfileBoards: 'boards.matchProfileBoards',
} as const;

export const DEFAULT_BOARD_SETTINGS: BoardSettings = {
  matchProfileBoards: true,
};
