const { SlashCommandBuilder } = require("discord.js");

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dado")
    .setDescription("Rola dados (ex: 1d20, 2d6, etc.).")
    .addStringOption(o => o.setName("formula").setDescription("Ex: 1d20, 2d6+3").setRequired(true)),
  async execute(interaction) {
    const f = interaction.options.getString("formula").toLowerCase().replace(/\s+/g, "");
    const m = f.match(/^([1-9]\d{0,1})d([1-9]\d{0,2})([+-]\d{1,4})?$/);
    if (!m) return interaction.reply({ content: "Formato inválido. Use algo como `1d20`, `2d6+3`.", ephemeral: true });

    const n = parseInt(m[1], 10);
    const sides = parseInt(m[2], 10);
    const mod = m[3] ? parseInt(m[3], 10) : 0;

    if (n > 50 || sides > 1000) return interaction.reply({ content: "Calma lá 😅 (máx 50 dados, d1000).", ephemeral: true });

    const rolls = Array.from({ length: n }, () => rollDie(sides));
    const sum = rolls.reduce((a, b) => a + b, 0) + mod;

    return interaction.reply({ content: `🎲 **${f}** → [${rolls.join(", ")}] ${mod ? (mod > 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`) : ""} = **${sum}**` });
  }
};
