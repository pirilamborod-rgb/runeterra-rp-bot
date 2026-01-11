const { log } = require("../utils/logger");

const reactCooldown = new Map(); // key userId -> lastMs

module.exports = {
  name: "messageReactionAdd",
  async execute(reaction, user, ctx) {
    try {
      if (!reaction.message?.guild) return;
      if (user?.bot) return;

      const cfg = ctx.config.runepoints || {};
      const points = Number(cfg.reactionPoints ?? 2);
      const cd = Number(cfg.reactionCooldownSeconds ?? 60) * 1000;

      const now = Date.now();
      const last = reactCooldown.get(user.id) || 0;
      if (now - last < cd) return;
      reactCooldown.set(user.id, now);

      ctx.runepoints.addPoints(user.id, points);
    } catch (e) {
      log(`Erro em messageReactionAdd (runepoints): ${e?.message || e}`);
    }
  }
};
