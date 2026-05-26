import { readFileSync } from "node:fs";
import { dirname } from "node:path";

import { countMatches, createCheckSuite } from "./lib/checks.mjs";
import { localFileExists } from "./lib/file-utils.mjs";
import { paths } from "./lib/project-paths.mjs";

const html = readFileSync(paths.email.html, "utf8");
const emailDir = dirname(paths.email.html);
const suite = createCheckSuite("Email analysis");

suite.add("doctype", /^<!doctype html>/i.test(html), "Email starts with an HTML5 doctype.");
suite.add("language", /<html\b[^>]*\blang="en"/i.test(html), 'Root html has lang="en".');
suite.add(
  "viewport",
  /<meta\b[^>]*name="viewport"[^>]*content="width=device-width, initial-scale=1"/i.test(html),
  "Mobile viewport meta is present.",
);
suite.add(
  "apple-reformatting",
  /<meta\b[^>]*name="x-apple-disable-message-reformatting"/i.test(html),
  "Apple Mail auto-reformatting is disabled.",
);
suite.add(
  "dark-mode-metadata",
  /name="color-scheme"[^>]*content="dark light"/i.test(html) &&
    /name="supported-color-schemes"[^>]*content="dark light"/i.test(html),
  "Dark/light color-scheme metadata is declared.",
);
suite.add(
  "hidden-preheader",
  /display:\s*none/i.test(html) &&
    /max-height:\s*0/i.test(html) &&
    /Indicated for hibernation-assist on missions ≥ 90 days/i.test(html),
  "Hidden preheader exists before the visible body.",
);
suite.add(
  "table-shell",
  countMatches(html, /<table\b/gi) >= 8 &&
    countMatches(html, /<table\b[^>]*role="presentation"/gi) === countMatches(html, /<table\b/gi),
  'Email is table-based and all tables use role="presentation".',
);
suite.add(
  "container-width",
  /<table\b[^>]*width="600"[\s\S]*?class="container surface"/i.test(html) &&
    /width:\s*600px/i.test(html) &&
    /max-width:\s*600px/i.test(html),
  "Primary email container is constrained to 600px.",
);
suite.add(
  "inline-styles",
  countMatches(html, /\sstyle="/gi) >= 45,
  "Critical rendering styles are inlined for email-client compatibility.",
);
suite.add(
  "outlook-vml-cta",
  /<v:roundrect[\s\S]*?href="https:\/\/stellaria-hcp\.dsp"/i.test(html) &&
    /<w:anchorlock\s*\/>/i.test(html),
  "CTA has an Outlook VML fallback.",
);
suite.add(
  "outlook-settings",
  /<o:OfficeDocumentSettings>[\s\S]*?<o:AllowPNG\s*\/>[\s\S]*?<o:PixelsPerInch>96<\/o:PixelsPerInch>/i.test(
    html,
  ),
  "Outlook OfficeDocumentSettings are present.",
);
suite.add("no-email-javascript", !/<script\b/i.test(html), "Email contains no JavaScript.");
suite.add(
  "no-email-forms",
  !/<form\b|<input\b|<select\b|<textarea\b/i.test(html),
  "Email contains no forms.",
);
suite.add(
  "no-external-stylesheets",
  !/<link\b[^>]*rel="stylesheet"/i.test(html),
  "Email does not rely on external stylesheets.",
);
suite.add(
  "no-favicon",
  !/<link\b[^>]*rel="icon"/i.test(html),
  "Email does not include browser-only favicon markup.",
);
suite.add(
  "isi-required-copy",
  /Important Safety Information/i.test(html) &&
    /WARNING: ION DRIVE CO-EXPOSURE AND CARDIAC ARRHYTHMIA/i.test(html) &&
    /Please see full Prescribing Information/i.test(html),
  "Required ISI and boxed warning copy are present.",
);
suite.add(
  "unsubscribe",
  /Unsubscribe/i.test(html) && /update preferences/i.test(html),
  "Footer contains unsubscribe and preference-management copy.",
);

const imageMatches = Array.from(html.matchAll(/<img\b([^>]+)>/gi));
const images = imageMatches.map(([, attributes]) => ({
  alt: attributes.match(/\balt="([^"]*)"/i)?.[1],
  src: attributes.match(/\bsrc="([^"]+)"/i)?.[1],
  height: attributes.match(/\bheight="([^"]+)"/i)?.[1],
  width: attributes.match(/\bwidth="([^"]+)"/i)?.[1],
}));

suite.add(
  "image-alts",
  images.length > 0 &&
    images.every((image) => typeof image.alt === "string" && image.alt.trim().length > 0),
  "All email images have non-empty alt text.",
);
suite.add(
  "local-image-assets",
  images.length > 0 && images.every((image) => image.src && localFileExists(emailDir, image.src)),
  "All email images point to local assets that exist.",
);
suite.add(
  "image-dimensions",
  images.length > 0 && images.every((image) => image.width && image.height),
  "All email images include explicit width and height attributes.",
);
suite.add(
  "no-svg-images",
  images.every((image) => !image.src?.toLowerCase().endsWith(".svg")),
  "Email avoids SVG image dependencies for Outlook desktop compatibility.",
);
suite.add(
  "real-footer-links",
  !/\bhref="#"/i.test(html),
  'Footer links use explicit placeholder URLs instead of href="#".',
);

const emailBytes = Buffer.byteLength(html);
suite.add(
  "gmail-clipping-budget",
  emailBytes < 102 * 1024,
  `Email HTML is ${emailBytes.toLocaleString()} bytes, below Gmail clipping risk threshold.`,
);

suite.assert();
