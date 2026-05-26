import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
export const bannerDir = join(rootDir, "banner");
export const emailDir = join(rootDir, "email");
export const archiveName = "stellaria-fe-test.zip";
export const archivePath = join(rootDir, archiveName);

export const paths = {
  archive: archivePath,
  assets: join(rootDir, "assets"),
  banner: {
    assets: join(bannerDir, "assets"),
    dir: bannerDir,
    html: join(bannerDir, "index.html"),
    js: join(bannerDir, "banner.js"),
    styles: join(bannerDir, "styles.css"),
  },
  docs: join(rootDir, "docs"),
  email: {
    assets: join(emailDir, "assets"),
    dir: emailDir,
    html: join(emailDir, "index.html"),
  },
  packageJson: join(rootDir, "package.json"),
  root: rootDir,
  scripts: join(rootDir, "scripts"),
};
