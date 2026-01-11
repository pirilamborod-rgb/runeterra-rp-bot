const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDescription("Mostra seu perfil: RunePoints + ficha (se existir)."),
  async execute(interaction, ctx) {
    const pts = ctx.runepoints.getUser(interaction.user.id)?.points ?? 0;
    const ch = ctx.storage.loadCharacter(interaction.user.id);

    const lines = [
      `✨ **RunePoints:** ${pts}`
    ];

    if (ch) {
      lines.push(
        "",
        `🧾 **Ficha:** ${ch.nome} (${ch.idade})`,
        `• ${ch.origem} | ${ch.raca} | ${ch.classe}`,
        `• Runas: ${ch.runas}`
      );
      if (ch.avatarUrl) lines.push(`• Retrato: ${ch.avatarUrl}`);
    } else {
      lines.push("", "Você ainda não tem ficha. Use `/criar` 🙂");
    }

    return interaction.reply({ content: lines.join("\n"), ephemeral: true });
  }
};
