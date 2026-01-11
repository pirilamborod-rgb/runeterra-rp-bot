const { log } = require("../utils/logger");

// cooldown maps (in-memory)
const msgCooldown = new Map(); // userId -> lastTimestampMs

module.exports = {
  name: "messageCreate",
  async execute(message, ctx) {
    try {
      if (!message.guild) return;
      if (message.author?.bot) return;

      const cfg = ctx.config.runepoints || {};
      const points = Number(cfg.messagePoints ?? 1);
      const cd = Number(cfg.messageCooldownSeconds ?? 30) * 1000;

      const now = Date.now();
      const last = msgCooldown.get(message.author.id) || 0;
      if (now - last < cd) return;

      msgCooldown.set(message.author.id, now);

      ctx.runepoints.addPoints(message.author.id, points);
    } catch (e) {
      log(`Erro em messageCreate (runepoints): ${e?.message || e}`);
    }
  }
};
