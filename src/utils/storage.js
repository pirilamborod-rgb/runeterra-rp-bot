const fs = require("fs");
const path = require("path");

const charsDir = path.join(process.cwd(), "data", "personagens");
if (!fs.existsSync(charsDir)) fs.mkdirSync(charsDir, { recursive: true });

function getCharPath(userId) {
  return path.join(charsDir, `${userId}.json`);
}

function saveCharacter(userId, character) {
  const p = getCharPath(userId);
  fs.writeFileSync(p, JSON.stringify(character, null, 2), "utf8");
}

function loadCharacter(userId) {
  const p = getCharPath(userId);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

module.exports = { saveCharacter, loadCharacter };
