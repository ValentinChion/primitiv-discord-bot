import { execSync } from "child_process";
import { renameSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname;

const EXCLUDE = [
  ["app/(public)/map", ".build-excluded/map"],
  ["app/(admin)/primitiv/map-handler", ".build-excluded/map-handler"],
  ["app/api/map-pins", ".build-excluded/api-map-pins"],
];

function move(pairs) {
  for (const [from, to] of pairs) {
    const src = join(ROOT, from);
    const dst = join(ROOT, to);
    if (existsSync(src)) {
      mkdirSync(join(ROOT, ".build-excluded"), { recursive: true });
      renameSync(src, dst);
    }
  }
}

move(EXCLUDE);
try {
  execSync("pnpm run build && npx opennextjs-cloudflare build", {
    stdio: "inherit",
    cwd: ROOT,
  });
} finally {
  move(EXCLUDE.map(([from, to]) => [to, from]));
}
