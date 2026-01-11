const { SlashCommandBuilder } = require("discord.js");

const answers = [
  "Sim.", "Não.", "Talvez.", "Com certeza!", "Sem dúvida.",
  "Pergunte de novo mais tarde.", "Provavelmente.", "Improvável.",
  "Os sinais dizem que sim.", "Os sinais dizem que não.", "Confia.", "Melhor não."
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Pergunte algo ao oráculo.")
    .addStringOption(o => o.setName("pergunta").setDescription("Sua pergunta").setRequired(true)),
  async execute(interaction) {
    const a = answers[Math.floor(Math.random() * answers.length)];
    return interaction.reply({ content: `🎱 ${a}` });
  }
};
