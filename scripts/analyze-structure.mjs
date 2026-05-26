import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createCheckSuite } from "./lib/checks.mjs";
import { directoryExists, fileExists } from "./lib/file-utils.mjs";
import { archiveName, paths, rootDir } from "./lib/project-paths.mjs";

const suite = createCheckSuite("Structure analysis");
const packageJson = JSON.parse(readFileSync(paths.packageJson, "utf8"));
const gitignore = readFileSync(join(rootDir, ".gitignore"), "utf8");
const prettierIgnore = readFileSync(join(rootDir, ".prettierignore"), "utf8");

const requiredFiles = [
  "README.md",
  "package.json",
  "package-lock.json",
  ".editorconfig",
  ".gitignore",
  ".htmlvalidate.json",
  ".prettierrc.json",
  ".prettierignore",
  "docs/REVIEW_GUIDE.md",
  "docs/QA_RESULTS.md",
  "assets/copy.js",
  "assets/tokens.css",
  "assets/stellaria-wordmark.svg",
  "assets/deep-space-pharma-lockup.svg",
  "assets/stellaria-capsule.png",
  "banner/index.html",
  "banner/styles.css",
  "banner/banner.js",
  "banner/assets/stellaria-wordmark.svg",
  "banner/assets/stellaria-capsule.png",
  "email/index.html",
  "email/assets/stellaria-capsule.png",
  "scripts/analyze-email.mjs",
  "scripts/analyze-banner.mjs",
  "scripts/analyze-structure.mjs",
  "scripts/build-archive.mjs",
  "scripts/serve.mjs",
  "scripts/lib/checks.mjs",
  "scripts/lib/file-utils.mjs",
  "scripts/lib/project-paths.mjs",
];

suite.add(
  "required-files",
  requiredFiles.every((path) => fileExists(join(rootDir, path))),
  "All reviewer-facing source, config, docs, and tooling files are present.",
);
suite.add(
  "deliverable-folders",
  directoryExists(paths.banner.dir) && directoryExists(paths.email.dir),
  "Banner and email remain separate self-contained deliverable folders.",
);
suite.add(
  "source-assets-folder",
  directoryExists(paths.assets),
  "Original source/reference assets are preserved separately from deliverable assets.",
);
suite.add("docs-folder", directoryExists(paths.docs), "Reviewer documentation lives in docs/.");

const requiredScripts = [
  "serve",
  "format",
  "format:check",
  "lint:html",
  "analyze",
  "analyze:email",
  "analyze:banner",
  "analyze:structure",
  "audit",
  "build",
  "quality",
];

suite.add(
  "package-scripts",
  requiredScripts.every((script) => typeof packageJson.scripts?.[script] === "string"),
  "package.json exposes all expected review and quality scripts.",
);
suite.add(
  "node-engine",
  packageJson.engines?.node === ">=20.19.0",
  "Node engine is pinned to the supported production baseline.",
);
suite.add(
  "archive-ignored-by-format",
  prettierIgnore.includes("*.zip") && prettierIgnore.includes("**/*.png"),
  "Generated archives and binary images are excluded from formatter churn.",
);
suite.add(
  "dependencies-ignored-by-git",
  gitignore.includes("node_modules/") && gitignore.includes(".DS_Store"),
  "Local dependencies and OS artifacts are ignored by git.",
);

const zipEntries = execFileSync("zipinfo", ["-1", archiveName], {
  cwd: rootDir,
  encoding: "utf8",
}).trim();

const requiredArchiveEntries = [
  "README.md",
  "package.json",
  "package-lock.json",
  ".gitignore",
  "docs/REVIEW_GUIDE.md",
  "docs/QA_RESULTS.md",
  "banner/index.html",
  "banner/styles.css",
  "banner/banner.js",
  "email/index.html",
  "scripts/analyze-email.mjs",
  "scripts/analyze-banner.mjs",
  "scripts/analyze-structure.mjs",
];

suite.add(
  "archive-contents",
  requiredArchiveEntries.every((entry) => zipEntries.includes(entry)),
  "Generated archive contains deliverables, docs, package metadata, and validation tooling.",
);
suite.add(
  "archive-excludes-local-deps",
  !zipEntries.includes("node_modules/") && !zipEntries.includes(".git/"),
  "Generated archive excludes local dependencies and git internals.",
);

suite.assert();
