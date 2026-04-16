#!/usr/bin/env node
/**
 * Upload all variables from .env as Cloudflare Worker secrets.
 * Usage: node scripts/upload-secrets.mjs [--env-file .env.production]
 *
 * Lines starting with # and empty lines are skipped.
 * Values with spaces or special characters don't need quoting in .env.
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const envFileFlag = args.indexOf("--env-file");
const envFile = envFileFlag !== -1 ? args[envFileFlag + 1] : ".env";

let raw;
try {
  raw = readFileSync(envFile, "utf8");
} catch {
  console.error(`Could not read ${envFile}`);
  process.exit(1);
}

const secrets = Object.fromEntries(
  raw
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const eq = line.indexOf("=");
      return [line.slice(0, eq).trim(), line.slice(eq + 1).trim()];
    })
);

const count = Object.keys(secrets).length;
if (count === 0) {
  console.error("No variables found in", envFile);
  process.exit(1);
}

console.log(`Uploading ${count} secrets from ${envFile}…`);
Object.keys(secrets).forEach((k) => console.log(" ", k));

const tmpFile = join(tmpdir(), `wrangler-secrets-${Date.now()}.json`);
writeFileSync(tmpFile, JSON.stringify(secrets));

try {
  execSync(`npx wrangler secret bulk ${tmpFile}`, { stdio: "inherit" });
} finally {
  unlinkSync(tmpFile);
}
