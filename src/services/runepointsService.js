const fs = require("fs");
const path = require("path");

const dbPath = path.join(process.cwd(), "data", "runepoints.json");

function ensureDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({ users: {} }, null, 2), "utf8");
}

function readDb() {
  ensureDb();
  try {
    return JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch {
    return { users: {} };
  }
}

function writeDb(db) {
  ensureDb();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

function getUser(userId) {
  const db = readDb();
  const u = db.users[userId] || { points: 0, updatedAt: new Date().toISOString() };
  return u;
}

function addPoints(userId, amount) {
  const db = readDb();
  const u = db.users[userId] || { points: 0, updatedAt: new Date().toISOString() };
  u.points = Math.max(0, (u.points || 0) + amount);
  u.updatedAt = new Date().toISOString();
  db.users[userId] = u;
  writeDb(db);
  return u.points;
}

function setPoints(userId, points) {
  const db = readDb();
  const u = db.users[userId] || { points: 0, updatedAt: new Date().toISOString() };
  u.points = Math.max(0, Number(points) || 0);
  u.updatedAt = new Date().toISOString();
  db.users[userId] = u;
  writeDb(db);
  return u.points;
}

function top(limit = 10) {
  const db = readDb();
  const entries = Object.entries(db.users || {}).map(([userId, u]) => ({
    userId,
    points: Number(u.points) || 0,
    updatedAt: u.updatedAt
  }));
  entries.sort((a, b) => b.points - a.points);
  return entries.slice(0, limit);
}

module.exports = { getUser, addPoints, setPoints, top, _dbPath: dbPath };
