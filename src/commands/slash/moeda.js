const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("moeda")
    .setDescription("Cara ou coroa."),
  async execute(interaction) {
    const r = Math.random() < 0.5 ? "Cara" : "Coroa";
    return interaction.reply({ content: `🪙 Deu **${r}**!` });
  }
};
