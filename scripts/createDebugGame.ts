import db from "~/db";
import { createGameRecord, getAllBoardsIds, getGameByBoardId } from "~/dal/queries";
import type { Difficulty } from "~/types";

const difficulties = ["easy", "medium", "hard"] as const;

function isDifficulty(value: string): value is Difficulty {
  return difficulties.includes(value as Difficulty);
}

function printUsage() {
  console.log("Usage: bun run debug:game <boardId> [difficulty] [profileId]");
  console.log("");
  console.log("Examples:");
  console.log("  bun run debug:game castorice");
  console.log("  bun run debug:game the-herta-ruan-mei hard default");
}

async function run() {
  const [, , boardId, difficultyArg = "easy", profileId = "default"] = process.argv;

  if (!boardId || boardId === "--help" || boardId === "-h") {
    printUsage();
    return;
  }

  if (!isDifficulty(difficultyArg)) {
    throw new Error(`Unknown difficulty "${difficultyArg}". Use one of: ${difficulties.join(", ")}`);
  }

  const boardIds = await getAllBoardsIds();

  if (!boardIds.includes(boardId)) {
    throw new Error(`Board "${boardId}" not found. Available boards: ${boardIds.join(", ")}`);
  }

  const id = `debug-${Date.now()}`;
  const gameState = await getGameByBoardId(id, boardId, difficultyArg);

  await createGameRecord({
    id,
    profileId,
    difficulty: difficultyArg,
    gameMode: "classic",
    challengeMode: false,
  });

  db.query(`
    UPDATE games
    SET gameState = $gameState
    WHERE id = $id
  `).run({
    $id: id,
    $gameState: JSON.stringify(gameState),
  });

  console.log(`Created debug game for "${boardId}" (${difficultyArg})`);
  console.log(`Open: http://localhost:3000/game/${id}`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
