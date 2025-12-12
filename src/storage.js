const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function ensureFile() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], appeals: [] }, null, 2));
  }
}

function readDB() {
  ensureFile();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse DB, resetting file', err);
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], appeals: [] }, null, 2));
    return { users: [], appeals: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function getUser(telegramId) {
  const db = readDB();
  return db.users.find((u) => u.telegramId === telegramId) || null;
}

function saveUser(user) {
  const db = readDB();
  const idx = db.users.findIndex((u) => u.telegramId === user.telegramId);
  if (idx >= 0) {
    db.users[idx] = { ...db.users[idx], ...user };
  } else {
    db.users.push(user);
  }
  writeDB(db);
  return user;
}

function addAppeal(appeal) {
  const db = readDB();
  db.appeals.push(appeal);
  writeDB(db);
  return appeal;
}

function listAppealsByUser(telegramId) {
  const db = readDB();
  return db.appeals.filter((a) => a.telegramId === telegramId).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

module.exports = {
  getUser,
  saveUser,
  addAppeal,
  listAppealsByUser,
};
