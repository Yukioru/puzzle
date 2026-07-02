import fs from "node:fs";
import path from "node:path";
import { createProfilesJsonData } from "./profileBoards";

const profilesPath = path.join(process.cwd(), "public", "profiles.json");

export function generateProfilesJson() {
  const data = createProfilesJsonData();

  fs.writeFileSync(profilesPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log("✅ Связи профилей с досками успешно подготовлены!");
}

if (import.meta.main) {
  generateProfilesJson();
}
