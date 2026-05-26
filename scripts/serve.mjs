import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, relative } from "node:path";

import { rootDir } from "./lib/project-paths.mjs";

const port = Number(process.env.PORT || 8080);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".zip": "application/zip",
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const requestedPath = normalize(join(rootDir, pathname));
  const relativePath = relative(rootDir, requestedPath);

  if (relativePath.startsWith("..")) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  const filePath =
    existsSync(requestedPath) && statSync(requestedPath).isDirectory()
      ? join(requestedPath, "index.html")
      : requestedPath;

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Serving ${rootDir} at http://localhost:${port}`);
});
