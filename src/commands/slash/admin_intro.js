const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { ensureWebhookAndIntro, resetIntroState } = require("../../services/introWebhook");

function isAdmin(interaction, ctx) {
  const roleId = String(ctx.config.adminRoleId || "").trim();
  if (roleId) return interaction.member?.roles?.cache?.has(roleId);
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin_intro")
    .setDescription("Admin: reenviar a mensagem de introdução no canal de criação.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(o => o.setName("resetar").setDescription("Resetar estado e reenviar (recomendado)")),
  async execute(interaction, ctx) {
    if (!isAdmin(interaction, ctx)) {
      return interaction.reply({ content: "Você não tem permissão para usar esse comando.", ephemeral: true });
    }

    const reset = interaction.options.getBoolean("resetar");
    if (reset !== false) resetIntroState();

    const chId = String(ctx.config.characterCreationChannelId || "").trim();
    if (!chId) return interaction.reply({ content: "characterCreationChannelId não está configurado.", ephemeral: true });

    await ensureWebhookAndIntro(interaction.client, chId, ctx.config, { force: true });
    return interaction.reply({ content: "✅ Introdução enviada (ou reenviada).", ephemeral: true });
  }
};
