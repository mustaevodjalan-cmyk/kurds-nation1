#!/usr/bin/env node
/* tools/build-release.mjs
 *
 *   node tools/build-release.mjs gen-key [--key tools/release-key.private.pem]
 *       Creates a P-256 signing key. Prints the PUBLIC key as JWK: paste it into
 *       CONFIG.PUBLIC_KEYS_JWK in service-worker.js. Keep the private key OFFLINE.
 *
 *   node tools/build-release.mjs sign --dir out [--version 123] [--mirrors https://a/,https://b/] [--key ...]
 *       Hashes every file in the static export, writes releases.json and releases.json.sig into --dir.
 *       --version defaults to the current Unix time, so versions always increase (rollback protection).
 */
import { createHash, generateKeyPairSync, createPrivateKey, sign } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "node:fs";
import { join, relative, sep, dirname } from "node:path";

const [cmd, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("--")) continue;
  const next = rest[i + 1];
  args[rest[i].slice(2)] = next && !next.startsWith("--") ? next : "true";
}
const keyPath = args.key || "tools/release-key.private.pem";

const EXCLUDE = new Set(["releases.json", "releases.json.sig", "service-worker.js", ".DS_Store"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

if (cmd === "gen-key") {
  if (existsSync(keyPath)) { console.error(`Refusing to overwrite ${keyPath}`); process.exit(1); }
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  mkdirSync(dirname(keyPath), { recursive: true });
  writeFileSync(keyPath, privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600 });
  console.log("Private key written to", keyPath, "(keep offline, never commit)");
  console.log("Public key (paste into service-worker.js):");
  console.log(JSON.stringify(publicKey.export({ format: "jwk" }), null, 2));

} else if (cmd === "sign") {
  const dir = args.dir || "out";
  if (!existsSync(dir)) { console.error(`Directory not found: ${dir}`); process.exit(1); }
  if (!existsSync(keyPath)) { console.error(`Key not found: ${keyPath} (run gen-key first)`); process.exit(1); }

  const version = args.version ? parseInt(args.version, 10) : Math.floor(Date.now() / 1000);
  if (!Number.isInteger(version) || version < 1) { console.error("Invalid --version"); process.exit(1); }

  const mirrors = (args.mirrors && args.mirrors !== "true" ? args.mirrors.split(",") : []).map((s) => s.trim());
  if (!mirrors.every((m) => m.startsWith("https://"))) { console.error("Mirrors must start with https://"); process.exit(1); }

  const files = {};
  for (const abs of walk(dir).sort()) {
    const rel = relative(dir, abs).split(sep).join("/");
    if (EXCLUDE.has(rel.split("/").pop())) continue;
    files["/" + rel] = "sha256-" + createHash("sha256").update(readFileSync(abs)).digest("base64");
  }

  const bytes = Buffer.from(JSON.stringify({ version, created: new Date().toISOString(), mirrors, files }, null, 2) + "\n");
  writeFileSync(join(dir, "releases.json"), bytes);

  /* WebCrypto expects the raw r||s signature format (IEEE P1363), not DER. */
  const sig = sign("sha256", bytes, { key: createPrivateKey(readFileSync(keyPath)), dsaEncoding: "ieee-p1363" });
  writeFileSync(join(dir, "releases.json.sig"), sig.toString("base64"));

  console.log(`Release ${version}: ${Object.keys(files).length} files signed.`);
  console.log("Serve releases.json byte-for-byte (no minification, no rewriting).");

} else {
  console.log("Usage: build-release.mjs gen-key | sign --dir out [--version N] [--mirrors https://a/,https://b/]");
  process.exit(cmd ? 1 : 0);
}
