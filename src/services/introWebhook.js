const fs = require("fs");
const path = require("path");
const { WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const statePath = path.join(process.cwd(), "data", "intro_webhook_state.json");

function readState() {
  try {
    if (!fs.existsSync(statePath)) return {};
    return JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    return {};
  }
}
function writeState(s) {
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(s, null, 2), "utf8");
}

function channelLink(guildId, channelId) {
  if (!guildId || !channelId) return null;
  return `https://discord.com/channels/${guildId}/${channelId}`;
}

async function ensureWebhookAndIntro(client, channelId, cfg = {}) {
  if (!channelId) return;

  const state = readState();
  if (state.sentIntro) return; // manda só uma vez

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) return;

  const hooks = await channel.fetchWebhooks().catch(() => null);
  let hook = hooks?.find(h => h.owner?.id === client.user.id);

  if (!hook) {
    hook = await channel.createWebhook({
      name: "Runeterra RP — Criação",
      avatar: client.user.displayAvatarURL()
    });
  }

  const wh = new WebhookClient({ id: hook.id, token: hook.token });

  const siteUrl = cfg.siteUrl || "https://runeterra-rp.weebly.com/";
  const discordUrl = cfg.discordInviteUrl || "https://discord.gg/M3cuVGCQf5";
  const createChUrl = channelLink(channel.guildId, channelId);

  const emb = new EmbedBuilder()
    .setTitle("🧾 Criação de Personagem — Runeterra RP")
    .setDescription(
      [
        "Bem-vindo(a) ao **Runeterra RP**!",
        "",
        "Aqui é o canal oficial para iniciar sua ficha. O fluxo é rápido e guiado:",
        "",
        "1) Use **`/criar`** neste canal",
        "2) Um **ticket privado** será aberto só pra você",
        "3) Você preenche **3 etapas**: Identidade → Mundo → Build",
        "4) Finalize em **Confirmar e salvar** ✅",
        "",
        "✨ Extras durante a criação:",
        "• **Retrato por link** (cole a imagem que quiser)",
        "• **História** (se for grande, o bot salva e envia em arquivo)",
        "",
        "Se estiver perdido(a), começa pelo site — ele explica tudo direitinho."
      ].join("\n")
    )
    .setFooter({ text: "Dica: depois você pode usar /ficha e /perfil." });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("🌐 Site do RPG").setURL(siteUrl),
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("💬 Discord Principal").setURL(discordUrl),
    new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel("📌 Este canal").setURL(createChUrl)
  );

  await wh.send({ embeds: [emb], components: [row] });

  state.sentIntro = true;
  state.sentAt = new Date().toISOString();
  writeState(state);
}

module.exports = { ensureWebhookAndIntro };
