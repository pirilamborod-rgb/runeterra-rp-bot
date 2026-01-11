const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("criar")
    .setDescription("Inicia a criação do seu personagem (abre um ticket privado)."),
  async execute(interaction, ctx) {
    const allowedChannelId = String(ctx.config.characterCreationChannelId || "").trim();
    if (allowedChannelId && interaction.channelId !== allowedChannelId) {
      return interaction.reply({
        content: `Use este comando apenas no canal de criação de personagem <#${allowedChannelId}>.`,
        ephemeral: true
      });
    }

    const { createTicketAndStartFlow } = ctx;
    await interaction.reply({ content: "Beleza! Vou abrir seu ticket de criação ✅", ephemeral: true });
    await createTicketAndStartFlow(interaction.guild, interaction.user);
  }
};
