/* service-worker.js — Network Nation
 *
 * Offline-first service worker for hostile networks:
 *  - Every release is a SIGNED manifest (releases.json + releases.json.sig, ECDSA P-256 / SHA-256).
 *  - Every file is verified against its SHA-256 hash before it is cached or served.
 *    Mirrors and IPFS gateways are therefore UNTRUSTED transports: they cannot alter code.
 *  - A new release is downloaded completely into its own cache and only then activated (atomic switch).
 *  - Rollback protection: manifest.version must be strictly greater than the installed one.
 *  - Navigations are answered from the device cache without touching the network, so the app opens
 *    even when DNS/IP/SNI blocking makes the origin unreachable.
 *  - Network calls use hard timeouts, because censors often black-hole packets instead of refusing them.
 *
 * Build and sign releases with: tools/build-release.mjs
 */
"use strict";

/* ====================== CONFIG ====================== */
const CONFIG = {
  /* Public keys (JWK, P-256) allowed to sign releases. Output of: node tools/build-release.mjs gen-key
     Use two keys (primary + offline backup) so a lost key can be rotated without breaking clients. */
  PUBLIC_KEYS_JWK: [
    // { kty: "EC", crv: "P-256", x: "...", y: "..." },
  ],
  /* LOCAL TESTING ONLY. Never ship with true: it disables signature checks. */
  DEV_SKIP_SIGNATURE: false,

  /* Extra base URLs (with https://, no trailing path needed) that serve the SAME static site and
     releases.json: ENS gateway, IPNS gateways, diaspora mirrors. The signed manifest can add more. */
  BOOTSTRAP_MIRRORS: [
    // "https://kurdnation.eth.limo/",
  ],

  NETWORK_TIMEOUT_MS: 5000,        // runtime fetches for non-precached files
  MANIFEST_TIMEOUT_MS: 8000,
  FILE_TIMEOUT_MS: 20000,
  UPDATE_CHECK_INTERVAL_MS: 6 * 60 * 60 * 1000,   // after a successful check
  UPDATE_RETRY_INTERVAL_MS: 30 * 60 * 1000,       // after a failed check
  DOWNLOAD_CONCURRENCY: 4,
  MAX_MANIFEST_BYTES: 2 * 1024 * 1024,
  MAX_FILES: 5000,
  RUNTIME_MAX_ENTRIES: 60,

  /* Added to cached HTML responses. 'unsafe-inline' is needed by Next.js inline bootstrap scripts;
     tighten with hashes once the build is stable. Keep APPLY_CSP false while using the Tailwind CDN sandbox page. */
  APPLY_CSP: false,
  HTML_CSP: "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; " +
            "connect-src 'self' https: wss:; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'",

  DEBUG: false
};

/* ====================== CONSTANTS ====================== */
const SCOPE = self.registration.scope;                 // e.g. https://x.eth.limo/  or  https://gw/ipfs/<CID>/
const META_CACHE = "nn-meta";
const RUNTIME_CACHE = "nn-runtime";
const RELEASE_PREFIX = "nn-release-";
const META_KEY = new URL("__nn_meta__", SCOPE).href;
const SHA_RE = /^sha256-[A-Za-z0-9+/]{43}=$/;

const MIME = {
  html: "text/html; charset=utf-8", js: "text/javascript; charset=utf-8", mjs: "text/javascript; charset=utf-8",
  css: "text/css; charset=utf-8", json: "application/json", webmanifest: "application/manifest+json",
  svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
  avif: "image/avif", gif: "image/gif", ico: "image/x-icon", woff: "font/woff", woff2: "font/woff2",
  ttf: "font/ttf", otf: "font/otf", wasm: "application/wasm", txt: "text/plain; charset=utf-8",
  onnx: "application/octet-stream", mp3: "audio/mpeg", ogg: "audio/ogg", mp4: "video/mp4", webm: "video/webm"
};

let lastAttempt = 0;
let syncing = null;

const log = (...a) => { if (CONFIG.DEBUG) console.log("[nn-sw]", ...a); };

/* ====================== SMALL UTILITIES ====================== */
function bytesToB64(buf) {
  const u = new Uint8Array(buf); let s = "";
  for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
  return btoa(s);
}
function b64ToBytes(b64) { return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); }
async function sha256Sri(buf) { return "sha256-" + bytesToB64(await crypto.subtle.digest("SHA-256", buf)); }

function withSlash(u) { return u.endsWith("/") ? u : u + "/"; }
function uniqueBases(list) {
  const out = [];
  for (const b of list) {
    try {
      const u = new URL(b, SCOPE);
      if (u.protocol !== "https:" && u.origin !== self.location.origin) continue; // mirrors must be https
      const s = withSlash(u.href);
      if (!out.includes(s)) out.push(s);
    } catch { /* ignore bad URL */ }
  }
  return out;
}

/* fetch with hard timeout; no cookies, no referrer for anything we fetch on our own */
async function fetchTimeout(input, ms, init = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(input, { credentials: "omit", referrerPolicy: "no-referrer", ...init, signal: ctl.signal });
  } finally { clearTimeout(timer); }
}

function extOf(path) { const m = /\.([a-z0-9]+)$/i.exec(path); return m ? m[1].toLowerCase() : ""; }

/* ====================== META (which release is active) ====================== */
async function getMeta() {
  try {
    const c = await caches.open(META_CACHE);
    const r = await c.match(META_KEY);
    return r ? await r.json() : null;
  } catch { return null; }
}
async function setMeta(meta) {
  const c = await caches.open(META_CACHE);
  await c.put(META_KEY, new Response(JSON.stringify(meta), { headers: { "content-type": "application/json" } }));
}

/* ====================== MANIFEST: fetch + verify ====================== */
async function verifySignature(bytes, sigText) {
  if (CONFIG.DEV_SKIP_SIGNATURE) { console.warn("[nn-sw] DEV_SKIP_SIGNATURE is ON: releases are NOT verified"); return true; }
  if (!CONFIG.PUBLIC_KEYS_JWK.length) { console.error("[nn-sw] no PUBLIC_KEYS_JWK configured"); return false; }
  let sig;
  try { sig = b64ToBytes(sigText.trim()); } catch { return false; }
  for (const jwk of CONFIG.PUBLIC_KEYS_JWK) {
    try {
      const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
      if (await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, bytes)) return true;
    } catch { /* try next key */ }
  }
  return false;
}

function validateManifest(m) {
  if (!m || typeof m !== "object") throw new Error("manifest: not an object");
  if (!Number.isInteger(m.version) || m.version < 1) throw new Error("manifest: bad version");
  if (!m.files || typeof m.files !== "object") throw new Error("manifest: no files");
  const paths = Object.keys(m.files);
  if (!paths.length || paths.length > CONFIG.MAX_FILES) throw new Error("manifest: bad file count");
  for (const p of paths) {
    if (!p.startsWith("/") || p.includes("..") || p.includes("\\") || p.includes("?") || p.includes("#")) throw new Error("manifest: bad path");
    if (!SHA_RE.test(m.files[p])) throw new Error("manifest: bad hash");
  }
  if (m.mirrors !== undefined) {
    if (!Array.isArray(m.mirrors) || m.mirrors.length > 12 || !m.mirrors.every((x) => typeof x === "string" && x.startsWith("https://"))) {
      throw new Error("manifest: bad mirrors");
    }
  }
  return m;
}

async function fetchSignedManifest(base) {
  const url = new URL("releases.json", base).href;
  const [mRes, sRes] = await Promise.all([
    fetchTimeout(url, CONFIG.MANIFEST_TIMEOUT_MS, { cache: "no-store" }),
    fetchTimeout(url + ".sig", CONFIG.MANIFEST_TIMEOUT_MS, { cache: "no-store" })
  ]);
  if (!mRes.ok || !sRes.ok) throw new Error("manifest http error");
  const bytes = await mRes.arrayBuffer();
  if (bytes.byteLength > CONFIG.MAX_MANIFEST_BYTES) throw new Error("manifest too large");
  if (!(await verifySignature(bytes, await sRes.text()))) throw new Error("manifest signature invalid");
  return validateManifest(JSON.parse(new TextDecoder().decode(bytes)));
}

/* Ask all bases in parallel; use the highest signed version; remember which bases hold it. */
async function findLatestManifest(bases) {
  const results = await Promise.allSettled(bases.map((b) => fetchSignedManifest(b).then((m) => ({ m, base: b }))));
  const ok = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  if (!ok.length) return null;
  const best = ok.reduce((a, b) => (b.m.version > a.m.version ? b : a));
  const sources = ok.filter((x) => x.m.version === best.m.version).map((x) => x.base);
  return { manifest: best.m, sources };
}

/* ====================== RELEASE DOWNLOAD ====================== */
async function fetchVerifiedInto(cache, path, expected, sources) {
  let lastErr = new Error("no sources");
  for (const base of sources) {
    try {
      const res = await fetchTimeout(new URL(path.slice(1), base).href, CONFIG.FILE_TIMEOUT_MS, { cache: "no-cache" });
      if (!res.ok) throw new Error("http " + res.status);
      const buf = await res.arrayBuffer();
      if ((await sha256Sri(buf)) !== expected) throw new Error("hash mismatch: " + path);
      const type = MIME[extOf(path)] || res.headers.get("content-type") || "application/octet-stream";
      await cache.put(new URL(path.slice(1), SCOPE).href, new Response(buf, { status: 200, headers: { "content-type": type } }));
      return;
    } catch (e) { lastErr = e; log("source failed", path, e.message); }
  }
  throw lastErr;
}

async function downloadRelease(manifest, sources) {
  const name = RELEASE_PREFIX + manifest.version;
  await caches.delete(name);
  const cache = await caches.open(name);
  const entries = Object.entries(manifest.files);
  let i = 0, failed = null;
  const worker = async () => {
    while (i < entries.length && !failed) {
      const [path, hash] = entries[i++];
      try { await fetchVerifiedInto(cache, path, hash, sources); } catch (e) { failed = e; }
    }
  };
  await Promise.all(Array.from({ length: CONFIG.DOWNLOAD_CONCURRENCY }, worker));
  if (failed) { await caches.delete(name); throw failed; }
  return name;
}

async function commitRelease(manifest, cacheName, oldMeta) {
  await setMeta({
    version: manifest.version,
    cacheName,
    prevCacheName: oldMeta && oldMeta.cacheName !== cacheName ? oldMeta.cacheName : null, // keeps old chunks for open pages
    mirrors: manifest.mirrors || [],
    checkedAt: Date.now()
  });
  await cleanupOrphans();
}

async function cleanupOrphans() {
  const meta = await getMeta();
  const keep = new Set([META_CACHE, RUNTIME_CACHE, meta && meta.cacheName, meta && meta.prevCacheName]);
  for (const k of await caches.keys()) {
    if (k.startsWith(RELEASE_PREFIX) && !keep.has(k)) await caches.delete(k);
  }
}

/* ====================== UPDATE LOGIC ====================== */
async function runSync({ initial = false, force = false } = {}) {
  const meta = await getMeta();
  const now = Date.now();
  if (!initial && !force) {
    if (now - lastAttempt < CONFIG.UPDATE_RETRY_INTERVAL_MS) return { status: "throttled" };
    if (meta && now - (meta.checkedAt || 0) < CONFIG.UPDATE_CHECK_INTERVAL_MS) return { status: "throttled" };
  }
  lastAttempt = now;

  const bases = initial
    ? uniqueBases([SCOPE])
    : uniqueBases([SCOPE, ...((meta && meta.mirrors) || []), ...CONFIG.BOOTSTRAP_MIRRORS]);

  const found = await findLatestManifest(bases);
  if (!found) return { status: "unreachable" };

  const { manifest, sources } = found;
  if (meta && manifest.version <= meta.version) {          // also blocks rollback to an older signed release
    await setMeta({ ...meta, checkedAt: Date.now() });
    return { status: "current", version: meta.version };
  }

  const cacheName = await downloadRelease(manifest, sources);
  await commitRelease(manifest, cacheName, meta);
  await notifyClients({ type: "NN_UPDATE_READY", version: manifest.version });
  return { status: "updated", version: manifest.version };
}

function checkForUpdate(opts) {
  if (!syncing) syncing = runSync(opts).catch((e) => { log("sync failed", e.message); return { status: "error" }; }).finally(() => { syncing = null; });
  return syncing;
}

async function notifyClients(msg) {
  for (const c of await self.clients.matchAll({ includeUncontrolled: true, type: "window" })) c.postMessage(msg);
}

/* ====================== LIFECYCLE ====================== */
self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const meta = await getMeta();
    const r = await runSync({ initial: true });             // throws away nothing if offline and already installed
    if (r.status === "unreachable" && !meta) throw new Error("first install needs the signed release");
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => { await cleanupOrphans(); await self.clients.claim(); })());
});

/* ====================== FETCH ====================== */
function hardened(res) {
  const h = new Headers(res.headers);
  h.set("X-Content-Type-Options", "nosniff");
  h.set("Referrer-Policy", "no-referrer");
  if (CONFIG.APPLY_CSP && (h.get("content-type") || "").includes("text/html")) h.set("Content-Security-Policy", CONFIG.HTML_CSP);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

function navigationCandidates(url) {
  const out = [];
  if (url.pathname.endsWith("/")) out.push(new URL("index.html", url.origin + url.pathname).href);
  else {
    out.push(url.origin + url.pathname + "/index.html");
    out.push(url.origin + url.pathname + ".html");
  }
  return out;
}

async function matchRelease(req, url, extra = []) {
  const meta = await getMeta();
  if (!meta) return null;
  const names = [meta.cacheName, meta.prevCacheName].filter(Boolean);
  const keys = [req.url, ...(req.mode === "navigate" ? navigationCandidates(url) : []), ...extra];
  for (const name of names) {
    const cache = await caches.open(name);
    for (const k of keys) {
      const hit = await cache.match(k, { ignoreSearch: true });
      if (hit) return hit;
    }
  }
  return null;
}

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function handle(req, url) {
  /* 1. Precached release: answer from device, no network at all. */
  const hit = await matchRelease(req, url);
  if (hit) return hardened(hit);

  /* 2. Unknown same-origin resource: network with a short timeout, then runtime cache. */
  try {
    const res = await fetchTimeout(req, CONFIG.NETWORK_TIMEOUT_MS, { credentials: "same-origin", referrerPolicy: undefined });
    if (res.ok && res.type === "basic") {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(req, res.clone());
      await trim(cache, CONFIG.RUNTIME_MAX_ENTRIES);
    }
    return res;
  } catch {
    const cached = await (await caches.open(RUNTIME_CACHE)).match(req);
    if (cached) return hardened(cached);
    if (req.mode === "navigate") {
      const shell = await matchRelease(req, url, [new URL("offline/index.html", SCOPE).href, new URL("index.html", SCOPE).href]);
      if (shell) return hardened(shell);
    }
    return new Response("Offline", { status: 503, statusText: "Offline", headers: { "content-type": "text/plain; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;   // never proxy third parties
  if (/\/releases\.json(\.sig)?$/.test(url.pathname)) return;                       // manifests always go to network

  event.respondWith(handle(req, url));
  if (req.mode === "navigate") event.waitUntil(checkForUpdate());                   // throttled background check
});

/* ====================== MESSAGES / BACKGROUND SYNC ====================== */
self.addEventListener("message", (event) => {
  const d = event.data || {};
  const reply = (m) => { if (event.source) event.source.postMessage(m); };

  if (d.type === "NN_CHECK_UPDATE") {
    event.waitUntil(checkForUpdate({ force: true }).then((r) => reply({ type: "NN_UPDATE_STATUS", ...r })));
  } else if (d.type === "NN_GET_STATUS") {
    event.waitUntil(getMeta().then((m) => reply({ type: "NN_STATUS", version: m ? m.version : null })));
  } else if (d.type === "NN_WIPE") {
    /* Panic button: remove every cached file and unregister this worker. */
    event.waitUntil((async () => {
      for (const k of await caches.keys()) await caches.delete(k);
      reply({ type: "NN_WIPED" });
      await self.registration.unregister();
    })());
  }
});

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "nn-update") event.waitUntil(checkForUpdate());
});
