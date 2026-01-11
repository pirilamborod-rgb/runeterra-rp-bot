const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ficha")
    .setDescription("Mostra sua ficha salva (se existir)."),
  async execute(interaction, ctx) {
    const { storage } = ctx;
    const ch = storage.loadCharacter(interaction.user.id);
    if (!ch) {
      return interaction.reply({ content: "Você ainda não tem ficha salva. Use `/criar` para criar uma.", ephemeral: true });
    }
    const lines = [
      `**Nome:** ${ch.nome} (${ch.idade})`,
      `**Conceito:** ${ch.conceito}`,
      `**Origem:** ${ch.origem} | **Raça:** ${ch.raca} | **Classe:** ${ch.classe}`,
      `**Runas:** ${ch.runas}`,
      `**Maestrias:** ${ch.maestrias || "—"}`,
      `**Emprego:** ${ch.emprego || "—"}`,
      "",
      `_Atualizado em: ${ch.updatedAt}_`
    ];
    return interaction.reply({ content: lines.join("\n"), ephemeral: true });
  }
};
