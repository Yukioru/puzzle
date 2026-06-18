import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "build");
const standaloneDir = path.join(root, ".next", "standalone");
const staticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");

function copyRequired(source: string, destination: string) {
  if (!existsSync(source)) {
    throw new Error(`Required build artifact is missing: ${path.relative(root, source)}`);
  }

  cpSync(source, destination, { recursive: true });
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(path.join(outputDir, ".next"), { recursive: true });

copyRequired(standaloneDir, outputDir);
copyRequired(staticDir, path.join(outputDir, ".next", "static"));

if (existsSync(publicDir)) {
  cpSync(publicDir, path.join(outputDir, "public"), { recursive: true });
}

mkdirSync(path.join(outputDir, "data"), { recursive: true });

console.log("Standalone build exported to ./build");
console.log("Run it with: bun build/server.js");
