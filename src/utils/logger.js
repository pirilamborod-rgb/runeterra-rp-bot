const fs = require("fs");
const path = require("path");

const logDir = path.join(process.cwd(), "data", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function ts() {
  return new Date().toISOString();
}

function log(line) {
  const msg = `[${ts()}] ${line}`;
  console.log(msg);
  try {
    fs.appendFileSync(path.join(logDir, "bot.log"), msg + "\n", "utf8");
  } catch {}
}

module.exports = { log };
