import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const INDEX_FILE = path.join(ROOT, "index.html");
const PORT = Number(process.env.PORT || 3000);
const STATE_TOKEN = String(process.env.STATE_TOKEN || "");
const MAX_BODY_BYTES = 25 * 1024 * 1024;
const MAX_BACKUPS = Math.max(3, Number(process.env.MAX_STATE_BACKUPS || 10));
const CONFIG_NAME = "oneplan-storage-config.json";
const STATE_NAME = "oneplan-state.json";
const BACKUP_FOLDER = "oneplan-backups";
const STORAGE_LOCKED = String(process.env.ONEPLAN_STORAGE_LOCKED || "").toLowerCase() === "true";
let writeQueue = Promise.resolve();
let STORAGE = null;

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

function storageFromDirectory(mode, directory, source = "runtime") {
  const resolved = path.resolve(directory);
  return {
    mode,
    directory: resolved,
    stateFile: path.join(resolved, STATE_NAME),
    backupDir: path.join(resolved, BACKUP_FOLDER),
    source
  };
}

function environmentStorage() {
  if (!process.env.STATE_FILE && !process.env.STATE_BACKUP_DIR) return null;
  const stateFile = path.resolve(process.env.STATE_FILE || path.join(os.tmpdir(), STATE_NAME));
  const backupDir = path.resolve(process.env.STATE_BACKUP_DIR || path.join(path.dirname(stateFile), BACKUP_FOLDER));
  return {
    mode: "environment",
    directory: path.dirname(stateFile),
    stateFile,
    backupDir,
    source: "environment"
  };
}

function validateCustomDirectory(input) {
  const value = String(input || "").trim();
  if (!value) throw Object.assign(new Error("Custom storage path is required."), { status: 400 });
  if (value.includes("\0")) throw Object.assign(new Error("Storage path contains an invalid character."), { status: 400 });
  const resolved = path.isAbsolute(value) ? path.normalize(value) : path.resolve(ROOT, value);
  const rootPath = path.parse(resolved).root;
  if (resolved === rootPath) throw Object.assign(new Error("The filesystem root cannot be used as the storage directory."), { status: 400 });
  if (process.platform !== "win32") {
    const blocked = ["/etc", "/usr", "/bin", "/sbin", "/proc", "/sys", "/dev", "/boot"];
    if (blocked.some((prefix) => resolved === prefix || resolved.startsWith(prefix + path.sep))) {
      throw Object.assign(new Error("This protected system directory cannot be used for OnePlan storage."), { status: 400 });
    }
  }
  return resolved;
}

function resolveStorageChoice(mode, customPath = "") {
  switch (String(mode || "temporary")) {
    case "temporary":
      return storageFromDirectory("temporary", os.tmpdir());
    case "app-data":
      return storageFromDirectory("app-data", path.join(ROOT, "data"));
    case "render-disk":
      return storageFromDirectory("render-disk", "/var/data");
    case "custom":
      return storageFromDirectory("custom", validateCustomDirectory(customPath));
    case "environment": {
      const env = environmentStorage();
      if (!env) throw Object.assign(new Error("STATE_FILE or STATE_BACKUP_DIR is not configured."), { status: 400 });
      return env;
    }
    default:
      throw Object.assign(new Error("Unsupported storage mode."), { status: 400 });
  }
}

function configCandidates() {
  return [...new Set([
    process.env.ONEPLAN_STORAGE_CONFIG ? path.resolve(process.env.ONEPLAN_STORAGE_CONFIG) : "",
    path.join("/var/data", CONFIG_NAME),
    path.join(ROOT, "data", CONFIG_NAME),
    path.join(os.tmpdir(), CONFIG_NAME)
  ].filter(Boolean))];
}

async function fileExists(filename) {
  try { await fs.access(filename); return true; } catch { return false; }
}

async function testWritable(storage) {
  await fs.mkdir(storage.directory, { recursive: true });
  await fs.mkdir(storage.backupDir, { recursive: true });
  const probe = path.join(storage.directory, `.oneplan-write-test-${process.pid}-${Date.now()}`);
  await fs.writeFile(probe, "ok", { encoding: "utf8", mode: 0o600 });
  await fs.unlink(probe);
}

async function loadConfiguredStorage() {
  if (!STORAGE_LOCKED) {
    for (const filename of configCandidates()) {
      try {
        const parsed = JSON.parse(await fs.readFile(filename, "utf8"));
        const selected = resolveStorageChoice(parsed.mode, parsed.customPath || parsed.directory || "");
        selected.source = `config:${filename}`;
        await testWritable(selected);
        return selected;
      } catch (error) {
        if (error?.code !== "ENOENT") console.warn(`Storage config ignored (${filename}):`, error.message);
      }
    }
  }
  const env = environmentStorage();
  if (env) {
    await testWritable(env);
    return env;
  }
  const fallback = resolveStorageChoice("temporary");
  fallback.source = "default";
  await testWritable(fallback);
  return fallback;
}

async function persistStorageConfig(storage) {
  if (STORAGE_LOCKED) return;
  const config = {
    schemaVersion: 1,
    mode: storage.mode,
    customPath: storage.mode === "custom" ? storage.directory : "",
    directory: storage.directory,
    updatedAt: new Date().toISOString()
  };
  const payload = JSON.stringify(config, null, 2);
  const candidates = [...new Set([
    path.join(storage.directory, CONFIG_NAME),
    ...configCandidates()
  ])];
  for (const filename of candidates) {
    try {
      const parent = path.dirname(filename);
      if (filename.startsWith(path.join("/var/data", path.sep)) || filename === path.join("/var/data", CONFIG_NAME)) {
        if (!(await fileExists("/var/data"))) continue;
      }
      await fs.mkdir(parent, { recursive: true });
      await atomicWrite(filename, payload);
    } catch (error) {
      console.warn(`Storage config could not be written to ${filename}:`, error.message);
    }
  }
}

async function ensureStorage(storage = STORAGE) {
  await fs.mkdir(storage.directory, { recursive: true });
  await fs.mkdir(storage.backupDir, { recursive: true });
}

async function readRecord(storage = STORAGE) {
  try {
    const parsed = JSON.parse(await fs.readFile(storage.stateFile, "utf8"));
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

async function backupCurrent(record, storage = STORAGE) {
  if (!record) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `state-r${String(record.meta?.revision || 0).padStart(6, "0")}-${stamp}.json`;
  await atomicWrite(path.join(storage.backupDir, filename), JSON.stringify(record, null, 2));
  const files = (await fs.readdir(storage.backupDir)).filter((name) => name.endsWith(".json")).sort().reverse();
  await Promise.all(files.slice(MAX_BACKUPS).map((name) => fs.unlink(path.join(storage.backupDir, name)).catch(() => {})));
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
    await atomicWrite(STORAGE.stateFile, JSON.stringify(record, null, 2));
    return { record };
  });
  return writeQueue;
}

function storagePublicInfo(storage = STORAGE, record = null) {
  return {
    mode: storage.mode,
    directory: storage.directory,
    stateFile: storage.stateFile,
    backupDir: storage.backupDir,
    source: storage.source,
    locked: STORAGE_LOCKED,
    persistentHint: storage.mode === "render-disk"
      ? "Persistent only when a Render disk is mounted at /var/data."
      : storage.mode === "temporary"
        ? "Temporary server storage; data may disappear after restart or deploy."
        : storage.mode === "app-data"
          ? "Stored with the application filesystem; on Render this is normally ephemeral."
          : "Persistence depends on the mounted filesystem behind this path.",
    exists: Boolean(record),
    revision: record?.meta?.revision || 0,
    savedAt: record?.meta?.savedAt || null
  };
}

async function switchStorage(payload) {
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    if (STORAGE_LOCKED) throw Object.assign(new Error("Storage path is locked by ONEPLAN_STORAGE_LOCKED."), { status: 423 });
    const next = resolveStorageChoice(payload.mode, payload.customPath || "");
    await testWritable(next);
    const currentStorage = STORAGE;
    const currentRecord = await readRecord(currentStorage);
    const targetRecord = await readRecord(next);
    const migrateCurrent = payload.migrateCurrent !== false;
    const sameFile = path.resolve(next.stateFile) === path.resolve(currentStorage.stateFile);

    if (!sameFile && migrateCurrent && currentRecord) {
      if (targetRecord && !payload.overwriteTarget) {
        return { targetExists: true, targetMeta: targetRecord.meta, target: storagePublicInfo(next, targetRecord) };
      }
      if (targetRecord) await backupCurrent(targetRecord, next);
      await atomicWrite(next.stateFile, JSON.stringify(currentRecord, null, 2));
    }

    STORAGE = next;
    STORAGE.source = "runtime-selection";
    await persistStorageConfig(STORAGE);
    const activeRecord = await readRecord(STORAGE);
    return { active: storagePublicInfo(STORAGE, activeRecord), migrated: Boolean(!sameFile && migrateCurrent && currentRecord) };
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
      version: "5.4.5-gantt-sort-detail-structure",
      indexFile: "index.html",
      storageMode: STORAGE.mode,
      time: new Date().toISOString()
    });
  }

  if (url.pathname === "/api/version" && req.method === "GET") {
    return sendJson(res, 200, { version: "5.4.5-gantt-sort-detail-structure" });
  }

  if (url.pathname.startsWith("/api/")) {
    if (!authorized(req)) return sendJson(res, 401, { error: "Invalid or missing state token." });

    if (url.pathname === "/api/storage" && req.method === "GET") {
      try {
        const record = await readRecord();
        return sendJson(res, 200, {
          ok: true,
          storage: storagePublicInfo(STORAGE, record),
          options: [
            { mode: "temporary", label: "Temporary server storage", path: os.tmpdir() },
            { mode: "app-data", label: "Application data folder", path: path.join(ROOT, "data") },
            { mode: "render-disk", label: "Render persistent disk", path: "/var/data" },
            { mode: "custom", label: "Custom directory", path: "" }
          ]
        });
      } catch (error) {
        return sendJson(res, 500, { error: error.message || "Storage information could not be read." });
      }
    }

    if (url.pathname === "/api/storage" && req.method === "PUT") {
      try {
        const payload = JSON.parse((await readBody(req)) || "{}");
        const result = await switchStorage(payload);
        if (result.targetExists) {
          return sendJson(res, 409, {
            error: "The selected storage path already contains OnePlan data.",
            code: "TARGET_EXISTS",
            targetMeta: result.targetMeta,
            target: result.target
          });
        }
        return sendJson(res, 200, { ok: true, ...result });
      } catch (error) {
        console.error(error);
        return sendJson(res, error.status || 400, { error: error.message || "Storage path change failed." });
      }
    }

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

STORAGE = await loadConfiguredStorage();
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
  console.log(`OnePlan v5.4.5-gantt-sort-detail-structure running on 0.0.0.0:${PORT}`);
  console.log(`Serving ${INDEX_FILE}`);
  console.log(`Storage mode: ${STORAGE.mode}`);
  console.log(`Storage directory: ${STORAGE.directory}`);
});
