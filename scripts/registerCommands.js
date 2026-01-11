require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const botConfig = require("../config/bot.json");

const commands = [];
const commandsPath = path.join(process.cwd(), "src", "commands", "slash");

for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
  const cmd = require(path.join(commandsPath, file));
  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registrando comandos slash…");
    if (!botConfig.clientId || !botConfig.guildId) {
      throw new Error("Preencha config/bot.json com clientId e guildId.");
    }

    await rest.put(
      Routes.applicationGuildCommands(botConfig.clientId, botConfig.guildId),
      { body: commands }
    );

    console.log("✅ Comandos registrados com sucesso.");
  } catch (e) {
    console.error("❌ Falha ao registrar comandos:", e);
    process.exitCode = 1;
  }
})();
