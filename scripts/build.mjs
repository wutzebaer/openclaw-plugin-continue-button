import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, "src");
const distDir = join(root, "dist");
const manifestPath = join(root, "openclaw.plugin.json");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

for (const name of ["index.js", "contract.js"]) {
  const srcPath = join(srcDir, name);
  if (!existsSync(srcPath)) throw new Error(`missing src/${name}`);
  writeFileSync(join(distDir, name), readFileSync(srcPath, "utf8"));
  console.log(`  copied src/${name} -> dist/${name}`);
}

const bundlePath = join(srcDir, "control-ui-bundle.js");
if (!existsSync(bundlePath)) throw new Error("missing src/control-ui-bundle.js");
const controlUiBundle = readFileSync(bundlePath, "utf8");
const cssPath = join(srcDir, "control-ui.css");
const css = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";

const hash = createHash("sha256").update(controlUiBundle).update(css).digest("hex").slice(0, 16);
const controlUiDir = join(distDir, "control-ui", hash);
mkdirSync(controlUiDir, { recursive: true });
writeFileSync(join(controlUiDir, "index.js"), controlUiBundle);
writeFileSync(join(controlUiDir, "index.css"), css);
console.log(`  built control-ui -> dist/control-ui/${hash}/index.js (+index.css)`);

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const relEntry = relative(root, join(controlUiDir, "index.js")).split("\\").join("/");
const relStyles = relative(root, join(controlUiDir, "index.css")).split("\\").join("/");
manifest.controlUi = { entry: relEntry, styles: [relStyles] };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`  manifest updated: controlUi.entry = ${relEntry}`);
console.log("build complete");
