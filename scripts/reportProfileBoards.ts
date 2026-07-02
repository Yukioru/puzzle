import { createProfileBoardRows } from "./profileBoards";
import type { ProfileBoardRow } from "./profileBoards";

function printRows(title: string, rows: ProfileBoardRow[]) {
  console.log(title);
  console.log("");

  for (const row of rows) {
    console.log(`${row.profileId} — ${row.boards.length}`);
  }
}

const rows = createProfileBoardRows();
const rowsWithBoards = rows.filter((row) => row.boards.length > 0);
const rowsWithoutBoards = rows.filter((row) => row.boards.length === 0);

console.log(`Всего профилей: ${rows.length}`);
console.log(`Профилей с досками: ${rowsWithBoards.length}`);
console.log(`Профилей без досок: ${rowsWithoutBoards.length}`);
console.log("");

printRows("Профиль -> кол-во досок", rowsWithBoards);
console.log("");

console.log(`Профили без доски: ${rowsWithoutBoards.length}`);
console.log("");
console.log(rowsWithoutBoards.map((row) => row.profileId).join(", "));
