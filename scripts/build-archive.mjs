import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";

import { archiveName, archivePath, rootDir } from "./lib/project-paths.mjs";

rmSync(archivePath, { force: true });

execFileSync(
  "zip",
  [
    "-qr",
    archiveName,
    "README.md",
    "package.json",
    "package-lock.json",
    ".editorconfig",
    ".gitignore",
    ".htmlvalidate.json",
    ".prettierrc.json",
    ".prettierignore",
    "assets",
    "banner",
    "docs",
    "email",
    "scripts",
  ],
  { cwd: rootDir, stdio: "inherit" },
);

console.log(`Built ${archiveName}`);
