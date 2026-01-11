const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Mostra o top RunePoints do servidor (global do bot).")
    .addIntegerOption(o => o.setName("limite").setDescription("Quantos mostrar (1-20)").setMinValue(1).setMaxValue(20)),
  async execute(interaction, ctx) {
    const limit = interaction.options.getInteger("limite") || 10;
    const top = ctx.runepoints.top(limit);

    if (top.length === 0) return interaction.reply({ content: "Ainda não tem RunePoints por aqui.", ephemeral: true });

    const lines = top.map((t, i) => `${i + 1}. <@${t.userId}> — **${t.points}**`);
    return interaction.reply({ content: `🏆 **Top RunePoints**
` + lines.join("\n") });
  }
};
