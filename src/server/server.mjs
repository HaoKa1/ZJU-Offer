import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(serverDir, "..", "..");
const webDir = path.join(projectRoot, "src", "web");
const port = Number(process.env.PORT || 4782);
const dataDir = path.join(projectRoot, "data");
const configPath = path.join(dataDir, "database-config.json");
const shortcutsPath = path.join(dataDir, "shortcuts.json");
const SESSION_TTL_MS = 25000;
const SHUTDOWN_IDLE_MS = 15000;
const STARTUP_GRACE_MS = 60000;
const serverStartedAt = Date.now();
const activeSessions = new Map();
let lastSessionActivityAt = Date.now();
let hasSeenBrowserSession = false;

const HEADERS = {
  company: "公司名称",
  domain: "领域",
  company_type: "企业性质",
  position: "方向 / 岗位",
  city: "城市",
  role_type: "岗位性质",
  stage: "阶段",
  deadline: "投递截止时间",
  link: "投递链接",
  presentation: "宣讲会地点",
  presentation_at: "宣讲会时间",
  presentation_applied: "宣讲会投递",
  applied_flag: "是否投递",
  applied_at: "投递时间",
  written_test_at: "笔试时间",
  written_test_result: "笔试结果",
  feedback: "投递反馈",
  interview1_at: "一面时间",
  interview1_result: "一面结果",
  interview2_at: "二面时间",
  interview2_result: "二面结果",
  interview3_at: "三面时间",
  interview3_result: "三面结果"
};
const FIELDS = Object.keys(HEADERS);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8"
};

if (process.env.OFFER_DASHBOARD_AUTO_SHUTDOWN === "1") {
  const shutdownWatchdog = setInterval(() => {
    const now = Date.now();
    pruneExpiredSessions(now);
    if (activeSessions.size > 0) return;
    if (!hasSeenBrowserSession && now - serverStartedAt < STARTUP_GRACE_MS) return;
    if (now - lastSessionActivityAt < SHUTDOWN_IDLE_MS) return;
    console.log("Offer Dashboard server is idle; shutting down.");
    process.exit(0);
  }, 5000);
  shutdownWatchdog.unref?.();
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);

    if (url.pathname === "/api/health") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      if (req.method === "OPTIONS") {
        return send(res, 204, "text/plain; charset=utf-8", "");
      }
      const currentDbPath = await getCurrentDbPath();
      return sendJson(res, 200, { ok: true, port, storage: "sqlite", currentDbFile: currentDbPath ? path.basename(currentDbPath) : "" });
    }

    if (url.pathname === "/api/data" && req.method === "GET") {
      const currentDbPath = await getCurrentDbPath();
      const payload = currentDbPath ? await exportPayload(currentDbPath) : createEmptyPayload();
      res.setHeader("Cache-Control", "no-store");
      return sendJson(res, 200, payload);
    }

    if (url.pathname === "/api/shortcuts" && req.method === "GET") {
      return sendJson(res, 200, { shortcuts: await loadShortcutConfig() });
    }

    if (url.pathname === "/api/shortcuts" && req.method === "PUT") {
      return handleSaveShortcuts(req, res);
    }

    if (url.pathname === "/api/session/heartbeat" && req.method === "POST") {
      return handleSessionHeartbeat(req, res);
    }

    if (url.pathname === "/api/session/release" && req.method === "POST") {
      return handleSessionRelease(req, res);
    }

    if (url.pathname === "/api/databases" && req.method === "GET") {
      return sendJson(res, 200, await getDatabaseState());
    }

    if (url.pathname === "/api/databases/create" && req.method === "POST") {
      return handleCreateDatabase(req, res);
    }

    if (url.pathname === "/api/databases/switch" && req.method === "POST") {
      return handleSwitchDatabase(req, res);
    }

    if (url.pathname === "/api/databases/delete" && req.method === "POST") {
      return handleDeleteDatabase(req, res);
    }

    if (url.pathname === "/api/save-row" && req.method === "POST") {
      return handleSaveRow(req, res);
    }

    if (url.pathname === "/api/import-rows" && req.method === "POST") {
      return handleImportRows(req, res);
    }

    if (url.pathname === "/api/delete-row" && req.method === "POST") {
      return handleDeleteRow(req, res);
    }

    let filePath = url.pathname === "/" ? path.join(webDir, "index.html") : path.join(webDir, decodeURIComponent(url.pathname));
    filePath = path.normalize(filePath);

    if (!filePath.startsWith(webDir)) {
      return send(res, 403, "text/plain; charset=utf-8", "Forbidden");
    }

    if (!existsSync(filePath)) {
      return send(res, 404, "text/plain; charset=utf-8", "Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = mimeTypes[ext] || "application/octet-stream";
    const content = await readFile(filePath);
    res.setHeader("Cache-Control", ext === ".json" ? "no-store" : "public, max-age=60");
    return send(res, 200, mime, content);
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Resume dashboard server running at http://127.0.0.1:${port}`);
});

async function handleSaveRow(req, res) {
  const body = await readJsonBody(req);
  const recordId = body.rowNumber ? String(body.rowNumber) : "";
  const updates = sanitizeUpdates(body.updates || {});

  if (!Object.keys(updates).length) {
    return sendJson(res, 400, { error: "No editable fields were provided." });
  }

  const dbPath = await getCurrentDbPath();
  if (!dbPath) {
    return sendJson(res, 409, { error: "请先创建数据库，再保存投递信息。" });
  }

  const result = upsertRecord(dbPath, recordId, updates);
  return sendJson(res, 200, {
    ok: true,
    rowNumber: result.rowNumber,
    sheetName: result.sheetName,
    payload: result.payload
  });
}

async function handleImportRows(req, res) {
  const body = await readJsonBody(req);
  const records = Array.isArray(body.records) ? body.records : [];
  const sourceName = stringify(body.sourceName);

  if (!records.length) {
    return sendJson(res, 400, { error: "没有可导入的记录。" });
  }

  const dbPath = await getCurrentDbPath();
  if (!dbPath) {
    return sendJson(res, 409, { error: "请先创建数据库，再导入投递信息。" });
  }

  const result = importRecords(dbPath, records, sourceName);
  return sendJson(res, 200, {
    ok: true,
    importedCount: result.importedCount,
    payload: result.payload
  });
}

async function handleDeleteRow(req, res) {
  const body = await readJsonBody(req);
  const recordId = String(body.rowNumber || "").trim();
  if (!recordId) {
    return sendJson(res, 400, { error: "No record id was provided." });
  }

  const dbPath = await getCurrentDbPath();
  if (!dbPath) {
    return sendJson(res, 409, { error: "请先创建数据库，再删除投递信息。" });
  }

  const result = deleteRecord(dbPath, recordId);
  return sendJson(res, 200, {
    ok: true,
    rowNumber: result.rowNumber,
    sheetName: result.sheetName,
    payload: result.payload
  });
}

async function handleCreateDatabase(req, res) {
  const body = await readJsonBody(req);
  const displayName = String(body.name || "").trim();
  if (!displayName) {
    return sendJson(res, 400, { error: "Database name is required." });
  }

  const fileName = sanitizeDbFileName(displayName);
  if (!fileName) {
    return sendJson(res, 400, { error: "Database name is invalid." });
  }

  const dbPath = resolveDbPath(fileName);
  if (existsSync(dbPath)) {
    return sendJson(res, 409, { error: "A database with the same name already exists." });
  }

  initDb(dbPath, displayName);
  await saveDbConfig({ currentDbFile: fileName });
  return sendJson(res, 200, {
    ok: true,
    state: await getDatabaseState()
  });
}

async function handleSwitchDatabase(req, res) {
  const body = await readJsonBody(req);
  const fileName = sanitizeDbFileName(String(body.fileName || ""));
  if (!fileName) {
    return sendJson(res, 400, { error: "Database file name is required." });
  }

  const dbPath = resolveDbPath(fileName);
  if (!existsSync(dbPath)) {
    return sendJson(res, 404, { error: "Database file was not found." });
  }

  await saveDbConfig({ currentDbFile: fileName });
  return sendJson(res, 200, {
    ok: true,
    state: await getDatabaseState()
  });
}

async function handleDeleteDatabase(req, res) {
  const body = await readJsonBody(req);
  const fileName = sanitizeDbFileName(String(body.fileName || ""));
  if (!fileName) {
    return sendJson(res, 400, { error: "Database file name is required." });
  }

  const { currentDbFile } = await loadDbConfig();
  if (fileName === currentDbFile) {
    return sendJson(res, 409, { error: "当前正在使用的数据库不能删除，请先切换到其他数据库。" });
  }

  const dbPath = resolveDbPath(fileName);
  if (!existsSync(dbPath)) {
    return sendJson(res, 404, { error: "Database file was not found." });
  }

  await unlink(dbPath);
  return sendJson(res, 200, {
    ok: true,
    state: await getDatabaseState()
  });
}

async function handleSaveShortcuts(req, res) {
  const body = await readJsonBody(req);
  const shortcuts = sanitizeShortcutConfig(body.shortcuts || body);
  await saveShortcutConfig(shortcuts);
  return sendJson(res, 200, { ok: true, shortcuts });
}

async function handleSessionHeartbeat(req, res) {
  const body = await readJsonBody(req);
  const sessionId = String(body.sessionId || "").trim();
  if (!sessionId) {
    return sendJson(res, 400, { error: "Session id is required." });
  }

  const now = Date.now();
  hasSeenBrowserSession = true;
  activeSessions.set(sessionId, now);
  lastSessionActivityAt = now;
  pruneExpiredSessions(now);
  return sendJson(res, 200, { ok: true, activeSessions: activeSessions.size });
}

async function handleSessionRelease(req, res) {
  const body = await readJsonBody(req);
  const sessionId = String(body.sessionId || "").trim();
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
  lastSessionActivityAt = Date.now();
  return sendJson(res, 200, { ok: true, activeSessions: activeSessions.size });
}

async function getDatabaseState() {
  await mkdir(dataDir, { recursive: true });
  const configuredDbFile = (await loadDbConfig()).currentDbFile;
  const files = (await readdir(dataDir))
    .filter((name) => name.toLowerCase().endsWith(".sqlite3"))
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
  const currentDbFile = configuredDbFile && files.includes(configuredDbFile) ? configuredDbFile : "";

  const databases = [];
  for (const fileName of files) {
    try {
      databases.push({
        ...describeDb(resolveDbPath(fileName)),
        current: fileName === currentDbFile
      });
    } catch {
      databases.push({
        fileName,
        databaseName: path.parse(fileName).name,
        recordCount: 0,
        importedAt: "",
        importedFrom: "",
        current: fileName === currentDbFile
      });
    }
  }

  return { currentDbFile, databases };
}

async function loadDbConfig() {
  await mkdir(dataDir, { recursive: true });

  if (!existsSync(configPath)) {
    return { currentDbFile: "" };
  }

  try {
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const currentDbFile = sanitizeDbFileName(String(parsed.currentDbFile || ""));
    if (currentDbFile) {
      return { currentDbFile };
    }
  } catch {
    // Fall through to regenerate a sane config file.
  }

  return { currentDbFile: "" };
}

async function saveDbConfig(config) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
}

async function loadShortcutConfig() {
  await mkdir(dataDir, { recursive: true });

  if (!existsSync(shortcutsPath)) {
    return createEmptyShortcutConfig();
  }

  try {
    const raw = await readFile(shortcutsPath, "utf8");
    const parsed = JSON.parse(raw);
    return sanitizeShortcutConfig(parsed);
  } catch {
    return createEmptyShortcutConfig();
  }
}

async function saveShortcutConfig(config) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(shortcutsPath, JSON.stringify(sanitizeShortcutConfig(config), null, 2), "utf8");
}

async function getCurrentDbPath() {
  const { currentDbFile } = await loadDbConfig();
  if (!currentDbFile) return null;

  const dbPath = resolveDbPath(currentDbFile);
  return existsSync(dbPath) ? dbPath : null;
}

function openDb(dbPath) {
  const db = new DatabaseSync(dbPath);
  ensureSchema(db);
  return db;
}

function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL DEFAULT '',
      domain TEXT NOT NULL DEFAULT '',
      company_type TEXT NOT NULL DEFAULT '',
      position TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      role_type TEXT NOT NULL DEFAULT '',
      stage TEXT NOT NULL DEFAULT '',
      deadline TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL DEFAULT '',
      presentation TEXT NOT NULL DEFAULT '',
      presentation_at TEXT NOT NULL DEFAULT '',
      presentation_applied TEXT NOT NULL DEFAULT '',
      applied_flag TEXT NOT NULL DEFAULT '',
      applied_at TEXT NOT NULL DEFAULT '',
      written_test_at TEXT NOT NULL DEFAULT '',
      written_test_result TEXT NOT NULL DEFAULT '',
      feedback TEXT NOT NULL DEFAULT '',
      interview1_at TEXT NOT NULL DEFAULT '',
      interview1_result TEXT NOT NULL DEFAULT '',
      interview2_at TEXT NOT NULL DEFAULT '',
      interview2_result TEXT NOT NULL DEFAULT '',
      interview3_at TEXT NOT NULL DEFAULT '',
      interview3_result TEXT NOT NULL DEFAULT '',
      sort_index INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  const columns = new Set(db.prepare("PRAGMA table_info(records)").all().map((row) => row.name));
  for (const [column, definition] of [
    ["written_test_at", "TEXT NOT NULL DEFAULT ''"],
    ["written_test_result", "TEXT NOT NULL DEFAULT ''"]
  ]) {
    if (!columns.has(column)) {
      db.exec(`ALTER TABLE records ADD COLUMN ${column} ${definition}`);
    }
  }
}

function initDb(dbPath, displayName) {
  const db = openDb(dbPath);
  const name = stringify(displayName) || path.parse(dbPath).name;
  setMeta(db, "database_name", name);
  setMeta(db, "database_created_at", getMeta(db, "database_created_at", nowIso()) || nowIso());
  const summary = describeOpenDb(dbPath, db);
  db.close();
  return summary;
}

function describeDb(dbPath) {
  const db = openDb(dbPath);
  const summary = describeOpenDb(dbPath, db);
  db.close();
  return summary;
}

function describeOpenDb(dbPath, db) {
  const recordCount = db.prepare("SELECT COUNT(*) AS count FROM records").get().count;
  return {
    fileName: path.basename(dbPath),
    databaseName: getMeta(db, "database_name", path.parse(dbPath).name) || path.parse(dbPath).name,
    recordCount,
    importedAt: getMeta(db, "last_imported_at"),
    importedFrom: getMeta(db, "last_imported_from")
  };
}

async function exportPayload(dbPath) {
  const db = openDb(dbPath);
  const payload = exportPayloadFromOpenDb(dbPath, db);
  db.close();
  return payload;
}

function createEmptyPayload() {
  return {
    meta: {
      sourceLabel: "尚未创建数据库",
      sourceType: "empty",
      syncedAt: nowIso(),
      recordCount: 0,
      note: "请先创建一个本地 SQLite 数据库，再开始填写投递信息。",
      inputPath: "",
      sheetName: "records",
      editable: false,
      storage: "sqlite",
      databaseName: "",
      databaseFile: "",
      importedFrom: "",
      importedAt: ""
    },
    rows: []
  };
}

function exportPayloadFromOpenDb(dbPath, db) {
  const databaseName = getMeta(db, "database_name", path.parse(dbPath).name) || path.parse(dbPath).name;
  const rows = db.prepare(`
    SELECT id, company, domain, company_type, position, city, role_type, stage,
           deadline, link, presentation, presentation_at, presentation_applied,
           applied_flag, applied_at, written_test_at, written_test_result, feedback,
           interview1_at, interview1_result, interview2_at, interview2_result,
           interview3_at, interview3_result, created_at, updated_at
    FROM records
    ORDER BY sort_index ASC, id ASC
  `).all();

  const payloadRows = rows.map((row) => ({
    [HEADERS.company]: row.company,
    [HEADERS.domain]: row.domain,
    [HEADERS.company_type]: row.company_type,
    [HEADERS.position]: row.position,
    [HEADERS.city]: row.city,
    [HEADERS.role_type]: row.role_type,
    [HEADERS.stage]: row.stage,
    [HEADERS.deadline]: row.deadline,
    [HEADERS.link]: row.link,
    [HEADERS.presentation]: row.presentation,
    [HEADERS.presentation_at]: row.presentation_at,
    [HEADERS.presentation_applied]: row.presentation_applied,
    [HEADERS.applied_flag]: row.applied_flag,
    [HEADERS.applied_at]: row.applied_at,
    [HEADERS.written_test_at]: row.written_test_at,
    [HEADERS.written_test_result]: row.written_test_result,
    [HEADERS.feedback]: row.feedback,
    [HEADERS.interview1_at]: row.interview1_at,
    [HEADERS.interview1_result]: row.interview1_result,
    [HEADERS.interview2_at]: row.interview2_at,
    [HEADERS.interview2_result]: row.interview2_result,
    [HEADERS.interview3_at]: row.interview3_at,
    [HEADERS.interview3_result]: row.interview3_result,
    updated_at: row.updated_at,
    created_at: row.created_at,
    __rowNumber: row.id,
    __sheetName: "records"
  }));

  return {
    meta: {
      sourceLabel: databaseName,
      sourceType: "database",
      syncedAt: nowIso(),
      recordCount: payloadRows.length,
      note: "The dashboard is backed by the local SQLite database in the project directory.",
      inputPath: dbPath,
      sheetName: "records",
      editable: true,
      storage: "sqlite",
      databaseName,
      databaseFile: path.basename(dbPath),
      importedFrom: getMeta(db, "last_imported_from"),
      importedAt: getMeta(db, "last_imported_at")
    },
    rows: payloadRows
  };
}

function upsertRecord(dbPath, recordId, updates) {
  const db = openDb(dbPath);
  const timestamp = nowIso();

  let rowId;
  if (String(recordId || "").trim()) {
    rowId = Number(recordId);
    if (!Number.isInteger(rowId) || rowId < 1) {
      db.close();
      throw new Error("Record id is invalid.");
    }

    const existing = db.prepare("SELECT * FROM records WHERE id = ?").get(rowId);
    if (!existing) {
      db.close();
      throw new Error("Record was not found.");
    }

    const values = Object.fromEntries(
      FIELDS.map((field) => [field, stringify(updates[HEADERS[field]] ?? existing[field])])
    );
    values.stage = normalizeStage(values);

    const assignments = FIELDS.map((field) => `${field} = ?`).join(", ");
    db.prepare(`UPDATE records SET ${assignments}, updated_at = ? WHERE id = ?`)
      .run(...FIELDS.map((field) => values[field]), timestamp, rowId);
  } else {
    const values = Object.fromEntries(FIELDS.map((field) => [field, stringify(updates[HEADERS[field]])]));
    values.stage = normalizeStage(values);
    const maxSort = db.prepare("SELECT COALESCE(MAX(sort_index), 0) AS sortIndex FROM records").get().sortIndex;
    const columns = [...FIELDS, "sort_index", "created_at", "updated_at"];
    const placeholders = columns.map(() => "?").join(", ");
    const result = db.prepare(`INSERT INTO records (${columns.join(", ")}) VALUES (${placeholders})`)
      .run(...FIELDS.map((field) => values[field]), maxSort + 1, timestamp, timestamp);
    rowId = Number(result.lastInsertRowid);
  }

  const payload = exportPayloadFromOpenDb(dbPath, db);
  db.close();
  return { rowNumber: rowId, sheetName: "records", payload };
}

function importRecords(dbPath, records, sourceName = "") {
  const db = openDb(dbPath);
  const timestamp = nowIso();
  const maxSort = db.prepare("SELECT COALESCE(MAX(sort_index), 0) AS sortIndex FROM records").get().sortIndex;
  const columns = [...FIELDS, "sort_index", "created_at", "updated_at"];
  const placeholders = columns.map(() => "?").join(", ");
  const insert = db.prepare(`INSERT INTO records (${columns.join(", ")}) VALUES (${placeholders})`);

  let importedCount = 0;
  db.exec("BEGIN");
  try {
    for (const record of records) {
      const updates = sanitizeUpdates(record || {});
      if (!Object.values(updates).some((value) => stringify(value))) continue;

      const values = Object.fromEntries(FIELDS.map((field) => [field, stringify(updates[HEADERS[field]])]));
      values.stage = normalizeStage(values);
      importedCount += 1;
      insert.run(...FIELDS.map((field) => values[field]), maxSort + importedCount, timestamp, timestamp);
    }

    if (importedCount > 0) {
      setMeta(db, "last_imported_at", timestamp);
      setMeta(db, "last_imported_from", sourceName);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    db.close();
    throw error;
  }

  const payload = exportPayloadFromOpenDb(dbPath, db);
  db.close();
  return { importedCount, payload };
}

function deleteRecord(dbPath, recordId) {
  const rowId = Number(recordId);
  if (!Number.isInteger(rowId) || rowId < 1) {
    throw new Error("Record id is invalid.");
  }

  const db = openDb(dbPath);
  db.prepare("DELETE FROM records WHERE id = ?").run(rowId);
  const payload = exportPayloadFromOpenDb(dbPath, db);
  db.close();
  return { rowNumber: rowId, sheetName: "records", payload };
}

function setMeta(db, key, value) {
  db.prepare("INSERT INTO meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, String(value || ""));
}

function getMeta(db, key, defaultValue = "") {
  const row = db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
  return row ? row.value : defaultValue;
}

function normalizeStage(record) {
  const explicit = stringify(record.stage);
  if (explicit) return explicit;

  const feedback = ["feedback", "written_test_result", "interview1_result", "interview2_result", "interview3_result"]
    .map((key) => stringify(record[key]))
    .join(" ")
    .toLowerCase();

  if (/(录取|offer|通过|oc)/.test(feedback)) return "已录取";
  if (/(淘汰|拒绝|未通过|fail|rejected)/.test(feedback)) return "已淘汰";
  if (stringify(record.interview3_at) && !stringify(record.interview3_result)) return "等待三面";
  if (stringify(record.interview2_at) && !stringify(record.interview2_result)) return "等待二面";
  if (stringify(record.interview1_at) && !stringify(record.interview1_result)) return "等待一面";
  if (stringify(record.written_test_at)) return "等待笔试";
  if (/(笔试|测评|oa|assessment)/.test(feedback)) return "等待笔试";
  if (/^(是|yes|true|1)$/i.test(stringify(record.applied_flag)) || stringify(record.applied_at)) return "已投递";
  return "未投递";
}

function nowIso() {
  return new Date().toISOString();
}

function stringify(value) {
  return value == null ? "" : String(value).trim();
}

function sanitizeDbFileName(value) {
  const raw = String(value || "").trim().replace(/\.sqlite3$/i, "");
  const safe = raw
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (!safe) return "";
  return `${safe}.sqlite3`;
}

function resolveDbPath(fileName) {
  const safeFileName = sanitizeDbFileName(fileName);
  if (!safeFileName) {
    throw new Error("Database file name is invalid.");
  }

  const resolved = path.normalize(path.join(dataDir, safeFileName));
  if (!resolved.startsWith(dataDir)) {
    throw new Error("Database path is outside the data directory.");
  }
  return resolved;
}

function createEmptyShortcutConfig() {
  return {
    recruitment: [],
    tools: []
  };
}

function sanitizeShortcutConfig(config) {
  return {
    recruitment: sanitizeShortcutList(config?.recruitment, 4),
    tools: sanitizeShortcutList(config?.tools, 4)
  };
}

function sanitizeShortcutList(items, maxItems) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      label: stringify(item?.label).slice(0, 24),
      url: normalizeShortcutUrl(item?.url)
    }))
    .filter((item) => item.label && item.url)
    .slice(0, maxItems);
}

function normalizeShortcutUrl(value) {
  let text = stringify(value);
  if (!text) return "";
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(text)) {
    text = `https://${text}`;
  }

  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
}

function pruneExpiredSessions(now = Date.now()) {
  for (const [sessionId, lastSeenAt] of activeSessions.entries()) {
    if (now - lastSeenAt > SESSION_TTL_MS) {
      activeSessions.delete(sessionId);
    }
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    totalBytes += chunk.length;
    if (totalBytes > 10 * 1024 * 1024) {
      throw new Error("Request body is too large.");
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function sanitizeUpdates(updates) {
  return Object.fromEntries(
    Object.entries(updates)
      .filter(([key]) => !String(key).startsWith("__"))
      .map(([key, value]) => [String(key), value == null ? "" : String(value)])
  );
}

function send(res, status, type, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, "application/json; charset=utf-8", JSON.stringify(payload, null, 2));
}
