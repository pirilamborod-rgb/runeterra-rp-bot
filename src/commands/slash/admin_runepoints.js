const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

function isAdmin(interaction, ctx) {
  const roleId = String(ctx.config.adminRoleId || "").trim();
  if (roleId) return interaction.member?.roles?.cache?.has(roleId);
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin_runepoints")
    .setDescription("Admin: gerenciar RunePoints.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sc =>
      sc.setName("add")
        .setDescription("Adiciona RunePoints a um usuário.")
        .addUserOption(o => o.setName("usuario").setDescription("Usuário").setRequired(true))
        .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade").setRequired(true))
    )
    .addSubcommand(sc =>
      sc.setName("set")
        .setDescription("Define RunePoints de um usuário.")
        .addUserOption(o => o.setName("usuario").setDescription("Usuário").setRequired(true))
        .addIntegerOption(o => o.setName("quantidade").setDescription("Valor").setRequired(true))
    ),
  async execute(interaction, ctx) {
    if (!isAdmin(interaction, ctx)) {
      return interaction.reply({ content: "Você não tem permissão para usar esse comando.", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("usuario");
    const q = interaction.options.getInteger("quantidade");

    if (sub === "add") {
      const v = ctx.runepoints.addPoints(user.id, q);
      return interaction.reply({ content: `✅ <@${user.id}> agora tem **${v}** RunePoints.`, ephemeral: true });
    }
    if (sub === "set") {
      const v = ctx.runepoints.setPoints(user.id, q);
      return interaction.reply({ content: `✅ <@${user.id}> agora tem **${v}** RunePoints.`, ephemeral: true });
    }
  }
};
