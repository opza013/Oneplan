import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const INDEX_FILE = path.join(ROOT, "index.html");
const PORT = Number(process.env.PORT || 3000);
const STATE_FILE = process.env.STATE_FILE || path.join(os.tmpdir(), "oneplan-state.json");
const BACKUP_DIR = process.env.STATE_BACKUP_DIR || path.join(os.tmpdir(), "oneplan-backups");
const STATE_TOKEN = String(process.env.STATE_TOKEN || "");
const MAX_BODY_BYTES = 25 * 1024 * 1024;
const MAX_BACKUPS = Math.max(3, Number(process.env.MAX_STATE_BACKUPS || 10));
let writeQueue = Promise.resolve();

function sendJson(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "same-origin"
  });
  res.end(JSON.stringify(value));
}

function authorized(req) {
  if (!STATE_TOKEN) return true;
  const supplied = String(req.headers["x-state-token"] || "");
  const a = Buffer.from(supplied);
  const b = Buffer.from(STATE_TOKEN);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function checksum(state) {
  return crypto.createHash("sha256").update(JSON.stringify(state)).digest("hex");
}

function validateState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return "State must be an object.";
  if (!state.settings || typeof state.settings !== "object") return "settings object is missing.";
  if (!Array.isArray(state.milestones)) return "milestones array is missing.";
  if (!Array.isArray(state.stores)) return "stores array is missing.";
  if (!Array.isArray(state.projects)) return "projects array is missing.";
  return "";
}

async function ensureStorage() {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.mkdir(BACKUP_DIR, { recursive: true });
}

async function readRecord() {
  try {
    const parsed = JSON.parse(await fs.readFile(STATE_FILE, "utf8"));
    if (parsed?.meta && parsed?.state) return parsed;
    const validationError = validateState(parsed);
    if (validationError) throw new Error(`Invalid state: ${validationError}`);
    return {
      meta: {
        schemaVersion: 1,
        revision: 1,
        savedAt: null,
        savedBy: "legacy",
        clientId: "legacy",
        checksum: checksum(parsed)
      },
      state: parsed
    };
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function atomicWrite(filename, content) {
  const temporary = `${filename}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, content, { encoding: "utf8", mode: 0o600 });
  await fs.rename(temporary, filename);
}

async function backupCurrent(record) {
  if (!record) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `state-r${String(record.meta?.revision || 0).padStart(6, "0")}-${stamp}.json`;
  await atomicWrite(path.join(BACKUP_DIR, filename), JSON.stringify(record, null, 2));
  const files = (await fs.readdir(BACKUP_DIR)).filter((name) => name.endsWith(".json")).sort().reverse();
  await Promise.all(files.slice(MAX_BACKUPS).map((name) => fs.unlink(path.join(BACKUP_DIR, name)).catch(() => {})));
}

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large."), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function saveRecord(payload) {
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    await ensureStorage();
    const current = await readRecord();
    const currentRevision = current?.meta?.revision || 0;
    const requestedRevision = payload.baseRevision == null ? null : Number(payload.baseRevision);
    if (!payload.force && current && requestedRevision !== currentRevision) {
      return { conflict: true, currentMeta: current.meta };
    }
    const validationError = validateState(payload.state);
    if (validationError) throw Object.assign(new Error(validationError), { status: 400 });
    await backupCurrent(current);
    const meta = {
      schemaVersion: 2,
      revision: currentRevision + 1,
      savedAt: new Date().toISOString(),
      savedBy: String(payload.savedBy || "OnePlan user").slice(0, 120),
      clientId: String(payload.clientId || "unknown").slice(0, 160),
      checksum: checksum(payload.state)
    };
    const record = { meta, state: payload.state };
    await atomicWrite(STATE_FILE, JSON.stringify(record, null, 2));
    return { record };
  });
  return writeQueue;
}

async function serveIndex(res) {
  try {
    const html = await fs.readFile(INDEX_FILE);
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "same-origin"
    });
    res.end(html);
  } catch (error) {
    console.error("index.html cannot be read:", error);
    sendJson(res, 500, { error: "index.html is missing from the repository root." });
  }
}

async function handler(req, res) {
  const url = new URL(req.url || "/", "http://localhost");

  if (url.pathname === "/api/health" && req.method === "GET") {
    return sendJson(res, 200, {
      ok: true,
      service: "oneplan-range-operation-platform",
      version: "5.0.0-direct-root",
      indexFile: "index.html",
      time: new Date().toISOString()
    });
  }

  if (url.pathname === "/api/version" && req.method === "GET") {
    return sendJson(res, 200, { version: "5.0.0-direct-root" });
  }

  if (url.pathname.startsWith("/api/")) {
    if (!authorized(req)) return sendJson(res, 401, { error: "Invalid or missing state token." });

    if (url.pathname === "/api/state" && req.method === "GET") {
      try {
        const record = await readRecord();
        return sendJson(res, 200, { ok: true, exists: Boolean(record), meta: record?.meta || { revision: 0 }, state: record?.state || null });
      } catch (error) {
        console.error(error);
        return sendJson(res, 500, { error: "State read failed." });
      }
    }

    if (url.pathname === "/api/state/meta" && req.method === "GET") {
      try {
        const record = await readRecord();
        return sendJson(res, 200, { ok: true, exists: Boolean(record), meta: record?.meta || { revision: 0 } });
      } catch {
        return sendJson(res, 500, { error: "State metadata read failed." });
      }
    }

    if (url.pathname === "/api/state" && req.method === "PUT") {
      try {
        const payload = JSON.parse((await readBody(req)) || "{}");
        const result = await saveRecord(payload);
        if (result.conflict) return sendJson(res, 409, { error: "Revision conflict", currentMeta: result.currentMeta });
        return sendJson(res, 200, { ok: true, meta: result.record.meta });
      } catch (error) {
        console.error(error);
        return sendJson(res, error.status || 400, { error: error.message || "State save failed." });
      }
    }

    if (url.pathname === "/api/state/export" && req.method === "GET") {
      try {
        const record = await readRecord();
        if (!record) return sendJson(res, 404, { error: "No cloud state exists." });
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="oneplan-cloud-state-r${record.meta.revision}.json"`,
          "Cache-Control": "no-store"
        });
        return res.end(JSON.stringify(record, null, 2));
      } catch {
        return sendJson(res, 500, { error: "Export failed." });
      }
    }

    return sendJson(res, 404, { error: "API endpoint not found." });
  }

  if (url.pathname === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }

  return serveIndex(res);
}

await ensureStorage();
await fs.access(INDEX_FILE).catch(() => {
  console.error(`FATAL: Missing ${INDEX_FILE}`);
  process.exit(1);
});

const server = http.createServer((req, res) => {
  handler(req, res).catch((error) => {
    console.error(error);
    if (!res.headersSent) sendJson(res, 500, { error: "Internal server error." });
    else res.end();
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`OnePlan v5.0.0-direct-root running on 0.0.0.0:${PORT}`);
  console.log(`Serving ${INDEX_FILE}`);
});
