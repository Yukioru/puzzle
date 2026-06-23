import db from "~/db";
import {
  AdminStats,
  AdminStatsBoardRow,
  AdminStatsDailyRow,
  AdminStatsDifficultyRow,
  AdminStatsEnduranceGameRow,
  AdminStatsEnduranceRoundRow,
  AdminStatsModeRow,
  AdminStatsProfileRow,
  AdminStatsRecentGameRow,
  AdminStatsStatusRow,
  Difficulty,
  GameStatus,
  IJigsawGame,
} from "~/types";

interface GameStatsRow {
  id: string;
  profileId: string;
  difficulty: Difficulty;
  challengeMode: 0 | 1;
  startedAt: number;
  finishedAt: number | null;
  time: number | null;
  points: number | null;
  status: GameStatus;
  challengeRound: number;
  challengeTimeLeft: number | null;
  gameState: string | null;
}

interface RoundStatsRow {
  gameId: string;
  round: number;
  difficulty: Difficulty;
  roundTime: number;
  basePoints: number;
  speedMultiplier: number;
  speedPoints: number;
  milestoneBonus: number;
  totalPoints: number;
  timeBonus: number;
}

const statuses: GameStatus[] = ['active', 'completed', 'abandoned'];
const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

function avg(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function maxOrNull(values: number[]) {
  if (values.length === 0) return null;
  return Math.max(...values);
}

function minOrNull(values: number[]) {
  if (values.length === 0) return null;
  return Math.min(...values);
}

function percent(part: number, total: number) {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function compactNumber(value: number | null | undefined) {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value ?? 0));
}

function formatDuration(ms: number | null | undefined) {
  if (ms == null) return 'нет данных';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}ч ${minutes}м ${seconds}с`;
  if (minutes > 0) return `${minutes}м ${seconds}с`;
  return `${seconds}с`;
}

function getDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function getFinishedTimes(games: GameStatsRow[]) {
  return games
    .map((game) => game.time)
    .filter((time): time is number => typeof time === 'number');
}

function safeParseBoardId(gameState: string | null) {
  if (!gameState) return null;

  try {
    const parsed = JSON.parse(gameState) as Partial<IJigsawGame>;
    return parsed.imageFileName ?? null;
  } catch {
    return null;
  }
}

function createStatusRows(games: GameStatsRow[]): AdminStatsStatusRow[] {
  return statuses.map((status) => {
    const count = games.filter((game) => game.status === status).length;

    return {
      status,
      count,
      percent: percent(count, games.length),
    };
  });
}

function createModeRows(games: GameStatsRow[]): AdminStatsModeRow[] {
  return [
    ['classic', false],
    ['endurance', true],
  ].map(([mode, isEndurance]) => {
    const modeGames = games.filter((game) => Boolean(game.challengeMode) === isEndurance);
    const finishedTimes = getFinishedTimes(modeGames);
    const pointValues = modeGames
      .map((game) => game.points)
      .filter((points): points is number => typeof points === 'number');

    return {
      mode,
      count: modeGames.length,
      active: modeGames.filter((game) => game.status === 'active').length,
      completed: modeGames.filter((game) => game.status === 'completed').length,
      abandoned: modeGames.filter((game) => game.status === 'abandoned').length,
      avgTime: avg(finishedTimes),
      longestTime: maxOrNull(finishedTimes),
      avgPoints: avg(pointValues),
    };
  }) as AdminStatsModeRow[];
}

function createDifficultyRows(games: GameStatsRow[]): AdminStatsDifficultyRow[] {
  return difficulties.map((difficulty) => {
    const difficultyGames = games.filter((game) => game.difficulty === difficulty);
    const finishedTimes = getFinishedTimes(difficultyGames);
    const pointValues = difficultyGames
      .map((game) => game.points)
      .filter((points): points is number => typeof points === 'number');

    return {
      difficulty,
      count: difficultyGames.length,
      active: difficultyGames.filter((game) => game.status === 'active').length,
      completed: difficultyGames.filter((game) => game.status === 'completed').length,
      abandoned: difficultyGames.filter((game) => game.status === 'abandoned').length,
      avgTime: avg(finishedTimes),
      longestTime: maxOrNull(finishedTimes),
      avgPoints: avg(pointValues),
    };
  });
}

function createDailyRows(games: GameStatsRow[], rounds: RoundStatsRow[]): AdminStatsDailyRow[] {
  const roundsByGame = new Map<string, RoundStatsRow[]>();

  rounds.forEach((round) => {
    roundsByGame.set(round.gameId, [...(roundsByGame.get(round.gameId) ?? []), round]);
  });

  const rows = new Map<string, AdminStatsDailyRow & { times: number[] }>();

  games.forEach((game) => {
    const date = getDateKey(game.startedAt);
    const row = rows.get(date) ?? {
      date,
      total: 0,
      active: 0,
      completed: 0,
      abandoned: 0,
      classic: 0,
      endurance: 0,
      avgTime: null,
      points: 0,
      rounds: 0,
      times: [],
    };

    row.total += 1;
    row[game.status] += 1;
    row[game.challengeMode ? 'endurance' : 'classic'] += 1;
    row.points += game.points ?? 0;
    row.rounds += roundsByGame.get(game.id)?.length ?? 0;

    if (typeof game.time === 'number') {
      row.times.push(game.time);
    }

    rows.set(date, row);
  });

  return [...rows.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ times, ...row }) => ({
      ...row,
      avgTime: avg(times),
    }));
}

function createProfileRows(games: GameStatsRow[], rounds: RoundStatsRow[]): AdminStatsProfileRow[] {
  const roundsByGame = new Map<string, RoundStatsRow[]>();

  rounds.forEach((round) => {
    roundsByGame.set(round.gameId, [...(roundsByGame.get(round.gameId) ?? []), round]);
  });

  const rows = new Map<string, AdminStatsProfileRow & { times: number[]; completedTimes: number[] }>();

  games.forEach((game) => {
    const row = rows.get(game.profileId) ?? {
      profileId: game.profileId,
      games: 0,
      completed: 0,
      abandoned: 0,
      active: 0,
      enduranceGames: 0,
      rounds: 0,
      points: 0,
      avgTime: null,
      bestTime: null,
      bestPoints: null,
      times: [],
      completedTimes: [],
    };

    row.games += 1;
    row[game.status] += 1;
    row.enduranceGames += game.challengeMode ? 1 : 0;
    row.rounds += roundsByGame.get(game.id)?.length ?? 0;
    row.points += game.points ?? 0;
    row.bestPoints = Math.max(row.bestPoints ?? 0, game.points ?? 0);

    if (typeof game.time === 'number') {
      row.times.push(game.time);
    }

    if (game.status === 'completed' && typeof game.time === 'number') {
      row.completedTimes.push(game.time);
    }

    rows.set(game.profileId, row);
  });

  return [...rows.values()]
    .map(({ times, completedTimes, ...row }) => ({
      ...row,
      avgTime: avg(times),
      bestTime: minOrNull(completedTimes),
    }))
    .sort((a, b) => b.games - a.games || b.points - a.points);
}

function createEnduranceGames(games: GameStatsRow[], rounds: RoundStatsRow[]): AdminStatsEnduranceGameRow[] {
  const roundsByGame = new Map<string, RoundStatsRow[]>();

  rounds.forEach((round) => {
    roundsByGame.set(round.gameId, [...(roundsByGame.get(round.gameId) ?? []), round]);
  });

  return games
    .filter((game) => game.challengeMode)
    .map((game) => {
      const gameRounds = roundsByGame.get(game.id) ?? [];
      const roundTimes = gameRounds.map((round) => round.roundTime);

      return {
        gameId: game.id,
        profileId: game.profileId,
        status: game.status,
        startedAt: game.startedAt,
        finishedAt: game.finishedAt,
        time: game.time,
        points: game.points ?? 0,
        rounds: gameRounds.length,
        avgRoundTime: avg(roundTimes),
        bestRoundTime: minOrNull(roundTimes),
        timeLeft: game.challengeTimeLeft,
      };
    })
    .sort((a, b) => b.points - a.points || b.rounds - a.rounds || (a.time ?? Infinity) - (b.time ?? Infinity));
}

function createEnduranceRoundRows(rounds: RoundStatsRow[]): AdminStatsEnduranceRoundRow[] {
  const rows = new Map<number, RoundStatsRow[]>();

  rounds.forEach((round) => {
    rows.set(round.round, [...(rows.get(round.round) ?? []), round]);
  });

  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([round, roundRows]) => {
      const roundTimes = roundRows.map((row) => row.roundTime);
      const totalPoints = roundRows.reduce((sum, row) => sum + row.totalPoints, 0);

      return {
        round,
        games: roundRows.length,
        avgTime: avg(roundTimes),
        bestTime: minOrNull(roundTimes),
        avgBasePoints: avg(roundRows.map((row) => row.basePoints)),
        avgSpeedMultiplier: avg(roundRows.map((row) => row.speedMultiplier)),
        avgSpeedPoints: avg(roundRows.map((row) => row.speedPoints)),
        avgMilestoneBonus: avg(roundRows.map((row) => row.milestoneBonus)),
        avgPoints: avg(roundRows.map((row) => row.totalPoints)),
        totalPoints,
        avgTimeBonus: avg(roundRows.map((row) => row.timeBonus)),
      };
    });
}

function createBoardRows(games: GameStatsRow[]): AdminStatsBoardRow[] {
  const rows = new Map<string, AdminStatsBoardRow & { times: number[]; completedTimes: number[] }>();

  games.forEach((game) => {
    const boardId = safeParseBoardId(game.gameState);
    if (!boardId) return;

    const row = rows.get(boardId) ?? {
      boardId,
      games: 0,
      completed: 0,
      abandoned: 0,
      active: 0,
      avgTime: null,
      bestTime: null,
      times: [],
      completedTimes: [],
    };

    row.games += 1;
    row[game.status] += 1;

    if (typeof game.time === 'number') {
      row.times.push(game.time);
    }

    if (game.status === 'completed' && typeof game.time === 'number') {
      row.completedTimes.push(game.time);
    }

    rows.set(boardId, row);
  });

  return [...rows.values()]
    .map(({ times, completedTimes, ...row }) => ({
      ...row,
      avgTime: avg(times),
      bestTime: minOrNull(completedTimes),
    }))
    .sort((a, b) => b.games - a.games || a.boardId.localeCompare(b.boardId));
}

function createRecentGames(games: GameStatsRow[], rounds: RoundStatsRow[]): AdminStatsRecentGameRow[] {
  const roundsByGame = new Map<string, number>();

  rounds.forEach((round) => {
    roundsByGame.set(round.gameId, (roundsByGame.get(round.gameId) ?? 0) + 1);
  });

  return [...games]
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, 30)
    .map((game) => ({
      gameId: game.id,
      profileId: game.profileId,
      difficulty: game.difficulty,
      mode: game.challengeMode ? 'endurance' : 'classic',
      status: game.status,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
      time: game.time,
      points: game.points,
      rounds: roundsByGame.get(game.id) ?? 0,
      boardId: safeParseBoardId(game.gameState),
    }));
}

export async function getAdminStats(): Promise<AdminStats> {
  const games = db.query(`
    SELECT
      id,
      profileId,
      difficulty,
      challengeMode,
      startedAt,
      finishedAt,
      time,
      points,
      status,
      challengeRound,
      challengeTimeLeft,
      gameState
    FROM games
    ORDER BY startedAt ASC
  `).all() as GameStatsRow[];

  const rounds = db.query(`
    SELECT
      gameId,
      round,
      difficulty,
      roundTime,
      basePoints,
      speedMultiplier,
      speedPoints,
      milestoneBonus,
      totalPoints,
      timeBonus
    FROM game_rounds
    ORDER BY round ASC, finishedAt ASC
  `).all() as RoundStatsRow[];

  const finishedTimes = getFinishedTimes(games);
  const completedGames = games.filter((game) => game.status === 'completed');
  const abandonedGames = games.filter((game) => game.status === 'abandoned');
  const activeGames = games.filter((game) => game.status === 'active');
  const enduranceGames = games.filter((game) => game.challengeMode);
  const totalPoints = games.reduce((sum, game) => sum + (game.points ?? 0), 0);
  const uniqueProfiles = new Set(games.map((game) => game.profileId)).size;

  return {
    generatedAt: Date.now(),
    metrics: [
      {
        label: 'Всего игр',
        value: compactNumber(games.length),
        hint: `${compactNumber(uniqueProfiles)} игроков`,
      },
      {
        label: 'Завершено',
        value: compactNumber(completedGames.length),
        hint: `${percent(completedGames.length, games.length)}% от всех игр`,
      },
      {
        label: 'Заброшено',
        value: compactNumber(abandonedGames.length),
        hint: `${percent(abandonedGames.length, games.length)}% от всех игр`,
      },
      {
        label: 'Активно',
        value: compactNumber(activeGames.length),
        hint: 'игры без финального статуса',
      },
      {
        label: 'Среднее время',
        value: formatDuration(avg(finishedTimes)),
        hint: 'по играм с финальным временем',
      },
      {
        label: 'Самое долгое время',
        value: formatDuration(maxOrNull(finishedTimes)),
        hint: 'completed + abandoned',
      },
      {
        label: 'Endurance игр',
        value: compactNumber(enduranceGames.length),
        hint: `${compactNumber(rounds.length)} сыгранных раундов`,
      },
      {
        label: 'Очки endurance',
        value: compactNumber(totalPoints),
        hint: 'сумма points из games',
      },
    ],
    statusRows: createStatusRows(games),
    modeRows: createModeRows(games),
    difficultyRows: createDifficultyRows(games),
    dailyRows: createDailyRows(games, rounds),
    profileRows: createProfileRows(games, rounds),
    enduranceGames: createEnduranceGames(games, rounds),
    enduranceRounds: createEnduranceRoundRows(rounds),
    boardRows: createBoardRows(games),
    recentGames: createRecentGames(games, rounds),
  };
}
