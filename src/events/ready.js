const { log } = require("../utils/logger");
const { ensureWebhookAndIntro } = require("../services/introWebhook");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    log(`Logado como ${client.user.tag}`);

    const channelId = client.config?.characterCreationChannelId;
    if (channelId) {
      await ensureWebhookAndIntro(client, channelId, client.config).catch((e) => {
        log(`Falha ao enviar intro via webhook: ${e?.message || e}`);
      });
    }
  }
};
