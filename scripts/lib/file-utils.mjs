import { existsSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, normalize, relative } from "node:path";

export function directorySize(path) {
  return readdirSync(path, { withFileTypes: true }).reduce((total, entry) => {
    const childPath = join(path, entry.name);
    return total + (entry.isDirectory() ? directorySize(childPath) : statSync(childPath).size);
  }, 0);
}

export function fileExists(path) {
  return existsSync(path) && statSync(path).isFile();
}

export function directoryExists(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export function localFileExists(baseDir, src) {
  if (/^(https?:)?\/\//i.test(src) || src.startsWith("data:")) {
    return false;
  }

  const resolved = normalize(join(baseDir, src));
  const relativePath = relative(baseDir, resolved);

  return !relativePath.startsWith("..") && !isAbsolute(relativePath) && fileExists(resolved);
}
