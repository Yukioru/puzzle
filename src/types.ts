import { Over } from "@dnd-kit/core";
import { ReactNode } from "react";

export interface IJigsawPiece {
  id: string;
  initialSides: [number, number, number, number];
  currentSides?: [number, number, number, number];
  imageUrl: string;
  imageRotation?: number;
  isMissed?: boolean;
  isComplete?: boolean;
  isEmpty?: boolean;
  isOnBoard?: boolean;
  isMatches?: boolean;
  coords?: {
    x: number;
    y: number;
  };
  cellOver?: Over | null;
}

export interface IJigsawPieceWithRender extends IJigsawPiece {
  render?: ReactNode;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IJigsawPalette {
  base: string;
  accents: [string, string, string];
}

export interface IJigsawGame {
  id: string;
  imageFileName: string;
  shuffledBoardsIds: string[];
  difficulty: Difficulty;
  palette?: IJigsawPalette;
  pieces: IJigsawPiece[];
  initialPieces: IJigsawPiece[];
  playablePieces: IJigsawPiece[];
}

export interface IJigsawGameCompleteInfo {
  gameId: string;
  boardId: string;
  gameState: IJigsawGame;
}

export type GameStatus = 'active' | 'completed' | 'abandoned';
export type StoredGameMode = 'classic' | 'endurance' | 'infinity';

export interface IGameRecord {
  id: string;
  profileId: string;
  difficulty: Difficulty;
  gameMode: StoredGameMode;
  challengeMode: boolean;
  startedAt: number;
  finishedAt: number | null;
  time: number | null;
  points: number | null;
  status: GameStatus;
  challengeRound: number;
  challengeTimeLeft: number | null;
  challengeLastTickAt: number | null;
  challengePausedAt: number | null;
}

export type GameMode = Difficulty | 'challenge' | 'infinity';

export interface EnduranceSettings {
  enabled: boolean;
  initialTime: number;
  minTimeBonus: number;
  timeBonusStep: number;
  maxTimeMultiplier: number;
  milestoneRounds: number;
  milestoneBaseBonus: number;
  easyBasePoints: number;
  mediumBasePoints: number;
  hardBasePoints: number;
  easyTargetTime: number;
  mediumTargetTime: number;
  hardTargetTime: number;
}

export interface InfinitySettings {
  enabled: boolean;
}

export interface EnduranceRoundResult {
  round: number;
  difficulty: Difficulty;
  roundTime: number;
  basePoints: number;
  speedMultiplier: number;
  speedPoints: number;
  milestoneBonus: number;
  totalPoints: number;
  timeBonus: number;
  nextDifficulty: Difficulty;
}

export interface EnduranceLeaderboardEntry {
  gameId: string;
  profileId: string;
  points: number;
  rounds: number;
  time: number;
  rank: string;
}

export interface DifficultyLeaderboardEntry {
  gameId: string;
  profileId: string;
  difficulty: Difficulty;
  time: number;
}

export interface LeaderboardsSnapshot {
  enduranceLeaderboard: EnduranceLeaderboardEntry[];
  difficultyLeaderboards: Record<Difficulty, DifficultyLeaderboardEntry[]>;
  enduranceSettings: EnduranceSettings;
}

export interface AdminStatsMetric {
  label: string;
  value: string;
  hint?: string;
}

export interface AdminStatsStatusRow {
  status: GameStatus;
  count: number;
  percent: number;
}

export interface AdminStatsModeRow {
  mode: 'classic' | 'endurance';
  count: number;
  active: number;
  completed: number;
  abandoned: number;
  avgTime: number | null;
  longestTime: number | null;
  avgPoints: number | null;
}

export interface AdminStatsDifficultyRow {
  difficulty: Difficulty;
  count: number;
  completed: number;
  abandoned: number;
  active: number;
  avgTime: number | null;
  longestTime: number | null;
  avgPoints: number | null;
}

export interface AdminStatsDailyRow {
  date: string;
  total: number;
  active: number;
  completed: number;
  abandoned: number;
  classic: number;
  endurance: number;
  avgTime: number | null;
  points: number;
  rounds: number;
}

export interface AdminStatsProfileRow {
  profileId: string;
  games: number;
  completed: number;
  abandoned: number;
  active: number;
  enduranceGames: number;
  rounds: number;
  points: number;
  avgTime: number | null;
  bestTime: number | null;
  bestPoints: number | null;
}

export interface AdminStatsEnduranceGameRow {
  gameId: string;
  profileId: string;
  status: GameStatus;
  startedAt: number;
  finishedAt: number | null;
  time: number | null;
  points: number;
  rounds: number;
  avgRoundTime: number | null;
  bestRoundTime: number | null;
  timeLeft: number | null;
}

export interface AdminStatsEnduranceRoundRow {
  round: number;
  games: number;
  avgTime: number | null;
  bestTime: number | null;
  avgBasePoints: number | null;
  avgSpeedMultiplier: number | null;
  avgSpeedPoints: number | null;
  avgMilestoneBonus: number | null;
  avgPoints: number | null;
  totalPoints: number;
  avgTimeBonus: number | null;
}

export interface AdminStatsBoardRow {
  boardId: string;
  games: number;
  completed: number;
  abandoned: number;
  active: number;
  avgTime: number | null;
  bestTime: number | null;
}

export interface AdminStatsRecentGameRow {
  gameId: string;
  profileId: string;
  difficulty: Difficulty;
  mode: 'classic' | 'endurance';
  status: GameStatus;
  startedAt: number;
  finishedAt: number | null;
  time: number | null;
  points: number | null;
  rounds: number;
  boardId: string | null;
}

export interface AdminStats {
  generatedAt: number;
  metrics: AdminStatsMetric[];
  statusRows: AdminStatsStatusRow[];
  modeRows: AdminStatsModeRow[];
  difficultyRows: AdminStatsDifficultyRow[];
  dailyRows: AdminStatsDailyRow[];
  profileRows: AdminStatsProfileRow[];
  enduranceGames: AdminStatsEnduranceGameRow[];
  enduranceRounds: AdminStatsEnduranceRoundRow[];
  boardRows: AdminStatsBoardRow[];
  recentGames: AdminStatsRecentGameRow[];
}
