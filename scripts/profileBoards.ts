import fs from "node:fs";
import path from "node:path";

export interface ProfileBoardRow {
  profileId: string;
  boards: string[];
}

interface FactionJsonRow {
  profiles?: string[];
}

interface FactionSourceJson {
  profiles?: Record<string, {
    factions?: Array<{
      title: string;
      url: string;
    }>;
  }>;
  factions?: Record<string, {
    title: string;
    url: string;
    profiles?: string[];
  }>;
}

const constantsPath = path.join(process.cwd(), "src", "constants.ts");
const boardsDir = path.join(process.cwd(), "public", "boards");
const factionsPath = path.join(process.cwd(), "public", "factions.json");
const tempFactionsPath = path.join(process.cwd(), "temp_factions.json");
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

function readJsonFile<T>(filePath: string): T | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function getFactionOrder() {
  const factionSource = readJsonFile<FactionSourceJson>(tempFactionsPath);
  if (!factionSource?.profiles || !factionSource.factions) {
    return new Map<string, string[]>();
  }

  const factionEntries = Object.entries(factionSource.factions);
  const factionIdByUrl = new Map(factionEntries.map(([factionId, faction]) => [faction.url, factionId]));
  const normalizeTitle = (title: string) => title.toLocaleLowerCase("ru").replace(/ё/g, "е");

  return new Map(
    Object.entries(factionSource.profiles).map(([profileId, profile]) => [
      profileId,
      (profile.factions ?? [])
        .map((faction) => {
          const factionIdByExactUrl = factionIdByUrl.get(faction.url);
          if (factionIdByExactUrl) {
            return factionIdByExactUrl;
          }

          const factionTitle = normalizeTitle(faction.title);
          const matchingFaction = factionEntries.find(([, sourceFaction]) => {
            const sourceFactionTitle = normalizeTitle(sourceFaction.title);

            return sourceFaction.profiles?.includes(profileId)
              && (sourceFactionTitle.startsWith(factionTitle) || factionTitle.startsWith(sourceFactionTitle));
          });

          return matchingFaction?.[0];
        })
        .filter((factionId): factionId is string => Boolean(factionId)),
    ]),
  );
}

export function getProfileFactionIds() {
  const factions = readJsonFile<Record<string, FactionJsonRow>>(factionsPath) ?? {};
  const orderedFactionIdsByProfileId = getFactionOrder();
  const factionIdsByProfileId = new Map<string, string[]>();

  for (const [factionId, faction] of Object.entries(factions)) {
    for (const profileId of faction.profiles ?? []) {
      const factionIds = factionIdsByProfileId.get(profileId) ?? [];
      factionIds.push(factionId);
      factionIdsByProfileId.set(profileId, factionIds);
    }
  }

  for (const [profileId, orderedFactionIds] of orderedFactionIdsByProfileId) {
    const factionIds = factionIdsByProfileId.get(profileId);
    if (!factionIds) {
      continue;
    }

    const existingFactionIds = new Set(factionIds);
    const orderedExistingFactionIds = orderedFactionIds.filter((factionId) => existingFactionIds.has(factionId));
    const missingFactionIds = factionIds.filter((factionId) => !orderedExistingFactionIds.includes(factionId));

    factionIdsByProfileId.set(profileId, [
      ...orderedExistingFactionIds,
      ...missingFactionIds,
    ]);
  }

  return factionIdsByProfileId;
}

export function createProfilesJsonData(rows = createProfileBoardRows(), factionIdsByProfileId = getProfileFactionIds()) {
  return Object.fromEntries(rows
    .sort((a, b) => a.profileId.localeCompare(b.profileId))
    .map((row) => [
      row.profileId,
      {
        factions: factionIdsByProfileId.get(row.profileId) ?? [],
        boards: row.boards,
      },
    ]));
}
