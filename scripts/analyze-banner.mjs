import { readFileSync } from "node:fs";

import { createCheckSuite } from "./lib/checks.mjs";
import { directorySize, localFileExists } from "./lib/file-utils.mjs";
import { paths } from "./lib/project-paths.mjs";

const html = readFileSync(paths.banner.html, "utf8");
const css = readFileSync(paths.banner.styles, "utf8");
const js = readFileSync(paths.banner.js, "utf8");
const suite = createCheckSuite("Banner analysis");

const imgSources = Array.from(html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi), ([, src]) => src);
const imageAttributes = Array.from(
  html.matchAll(/<img\b([^>]+)>/gi),
  ([, attributes]) => attributes,
);

suite.add("doctype", /^<!doctype html>/i.test(html), "Banner starts with an HTML5 doctype.");
suite.add(
  "ad-size-meta",
  /<meta\b[^>]*name="ad\.size"[^>]*content="width=300,height=600"/i.test(html),
  "IAB-style ad size metadata is present.",
);
suite.add(
  "stage-dimensions",
  /\.stage\s*{[\s\S]*?width:\s*300px;[\s\S]*?height:\s*600px;/i.test(css),
  "Stage CSS fixes the banner to 300x600.",
);
suite.add(
  "creative-dimensions",
  /\.creative\s*{[\s\S]*?width:\s*300px;[\s\S]*?height:\s*300px;/i.test(css),
  "Animated creative region is 300x300.",
);
suite.add(
  "isi-dimensions",
  /\.isi\s*{[\s\S]*?width:\s*300px;[\s\S]*?height:\s*300px;/i.test(css),
  "Static ISI region is 300x300.",
);
suite.add(
  "scrollable-isi",
  /\.isi-scroll\s*{[\s\S]*?overflow-y:\s*auto;/i.test(css) && /tabindex="0"/i.test(html),
  "ISI panel is independently scrollable and keyboard focusable.",
);
suite.add(
  "three-frames",
  /frame-one/i.test(html) && /frame-two/i.test(html) && /frame-three/i.test(html),
  "All three animation frames are present.",
);
suite.add(
  "final-hold",
  /animation:\s*frame-three/i.test(css) && /100%\s*{[\s\S]*?opacity:\s*1/i.test(css),
  "Frame 3 has a final hold state.",
);
suite.add(
  "reduced-motion",
  /@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(css) &&
    /countTarget\.textContent\s*=\s*['"]412['"]/i.test(js),
  "Reduced-motion fallback is implemented.",
);
suite.add(
  "count-up",
  /requestAnimationFrame/i.test(js) && /target\s*=\s*412/i.test(js),
  "412 stat count-up is implemented with requestAnimationFrame.",
);
suite.add(
  "local-assets",
  imgSources.length > 0 && imgSources.every((src) => localFileExists(paths.banner.dir, src)),
  "All banner images point to local assets that exist.",
);
suite.add(
  "image-dimensions",
  imageAttributes.length > 0 &&
    imageAttributes.every(
      (attributes) => /\bwidth="[^"]+"/i.test(attributes) && /\bheight="[^"]+"/i.test(attributes),
    ),
  "All banner images include explicit width and height attributes.",
);

const bannerBytes = directorySize(paths.banner.dir);
suite.add(
  "iab-size-budget",
  bannerBytes < 1024 * 1024,
  `Banner folder is ${bannerBytes.toLocaleString()} bytes, below the 1MB limit.`,
);

suite.assert();
