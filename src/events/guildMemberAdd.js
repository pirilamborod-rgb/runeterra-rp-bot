const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { log } = require("../utils/logger");

function channelLink(guildId, channelId) {
  if (!guildId || !channelId) return null;
  return `https://discord.com/channels/${guildId}/${channelId}`;
}

module.exports = {
  name: "guildMemberAdd",
  async execute(member, ctx) {
    try {
      const siteUrl = ctx.config.siteUrl || "https://runeterra-rp.weebly.com/";
      const discordUrl = ctx.config.discordInviteUrl || "https://discord.gg/M3cuVGCQf5";
      const createChannelId = String(ctx.config.characterCreationChannelId || "").trim();
      const createChUrl = channelLink(member.guild.id, createChannelId);

      const emb = new EmbedBuilder()
        .setTitle("🌟 Bem-vindo(a) ao Runeterra RP!")
        .setDescription(
          [
            `Oi, ${member.user.username}! 💙`,
            "",
            "Você acabou de entrar no **Runeterra RP**, um RPG ambientado em Runeterra (League of Legends).",
            "",
            "**Por onde começar**",
            `• Leia o site (regras e guias): **Runeterra RP**`,
            `• Quando estiver pronto(a), crie sua ficha no canal de criação e siga o passo a passo do bot`,
            "",
            "**O que o bot faz**",
            "• Abre um ticket privado pra você montar a ficha",
            "• Salva sua ficha e te deixa consultar depois com `/ficha` e `/perfil`",
            "• Você ganha **RunePoints** ao conversar e interagir no servidor ✨"
          ].join("\n")
        )
        .setFooter({ text: "Se não conseguir me mandar DM, verifique suas configurações de privacidade do Discord." });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("🌐 Site do RPG").setURL(siteUrl),
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("💬 Convite do Discord").setURL(discordUrl),
        new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("🧾 Canal de criação").setURL(createChUrl || discordUrl)
      );

      await member.send({ embeds: [emb], components: [row] }).catch(() => null);
    } catch (e) {
      log(`Erro em guildMemberAdd DM: ${e?.message || e}`);
    }
  }
};
