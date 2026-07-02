import fs from "node:fs";
import path from "node:path";

export interface ProfileBoardRow {
  profileId: string;
  boards: string[];
}

const constantsPath = path.join(process.cwd(), "src", "constants.ts");
const boardsDir = path.join(process.cwd(), "public", "boards");
const boardImageRegexp = /\.(jpe?g|png|webp)$/i;

export function getProfileIds() {
  const constants = fs.readFileSync(constantsPath, "utf8");
  const matches = constants.matchAll(/\{ id: '([^']+)'/g);

  return [...matches]
    .map((match) => match[1])
    .filter((profileId) => profileId !== "default")
    .sort();
}

export function getBoardIds() {
  return fs.readdirSync(boardsDir)
    .filter((file) => boardImageRegexp.test(file))
    .map((file) => path.basename(file, path.extname(file)))
    .sort();
}

function getProfileNeedles(profileId: string) {
  const needles = new Set([profileId]);

  if (profileId === "dan_heng_permansor-terrae" || profileId === "dan-heng_imbibitor-lunae") {
    needles.add("dan-heng");
  }

  if (profileId.startsWith("stelle_")) {
    needles.add("stelle");
    needles.add("trailblazer");
  }

  if (profileId.startsWith("caelus_")) {
    needles.add("caelus");
    needles.add("trailblazer");
  }

  if (profileId === "silver-wolf-lv999") {
    needles.add("silver-wolf");
  }

  if (profileId.startsWith("march-7th")) {
    needles.add("march");
  }

  if (profileId === "himeko-nova") {
    needles.add("himeko");
  }

  if (profileId === "blade-mortenax") {
    needles.add("blade");
  }

  return [...needles];
}

export function createProfileBoardRows(profileIds = getProfileIds(), boardIds = getBoardIds()): ProfileBoardRow[] {
  return profileIds
    .map((profileId) => {
      const needles = getProfileNeedles(profileId);
      const boards = boardIds.filter((boardId) => needles.some((needle) => boardId.includes(needle)));

      return {
        profileId,
        boards,
      };
    })
    .sort((a, b) => b.boards.length - a.boards.length || a.profileId.localeCompare(b.profileId));
}

export function createProfilesJsonData(rows = createProfileBoardRows()) {
  return Object.fromEntries(rows
    .sort((a, b) => a.profileId.localeCompare(b.profileId))
    .map((row) => [
      row.profileId,
      {
        faction: "",
        boards: row.boards,
      },
    ]));
}
