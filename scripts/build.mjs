import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Astro and Vite must agree on the project path when invoked through a junction.
const root = realpathSync(fileURLToPath(new URL("..", import.meta.url)));
const astro = join(root, "node_modules", "astro", "astro.js");
const result = spawnSync(process.execPath, [astro, "build", ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

for (const page of ["index.html", "event/index.html", "apply/index.html"]) {
  const html = readFileSync(join(root, "dist", page), "utf8");
  const css = html.match(/href="\/(_astro\/[^"]+\.css)"/)?.[1];
  if (!css || !existsSync(join(root, "dist", css))) {
    console.error(`Missing built site stylesheet on ${page}`);
    process.exitCode = 1;
  }
}
if (!process.exitCode) console.log("Built site stylesheets verified on /, /event/, and /apply/.");
