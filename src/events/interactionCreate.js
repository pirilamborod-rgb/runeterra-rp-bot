const { CUSTOM_ID } = require("../utils/constants");
const { log } = require("../utils/logger");

function isLikelyImageUrl(url) {
  if (typeof url !== "string") return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  if (url.length > 400) return false;

  // Aceita CDN do Discord e imagens comuns
  const lower = url.toLowerCase();
  const okExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
  const hasExt = okExt.some(ext => lower.includes(ext));
  const discordCdn = lower.includes("cdn.discordapp.com") || lower.includes("media.discordapp.net");
  return hasExt || discordCdn;
}

module.exports = {
  name: "interactionCreate",
  async execute(interaction, ctx) {
    try {
      // Slash commands
      if (interaction.isChatInputCommand()) {
        const cmd = ctx.commands.get(interaction.commandName);
        if (!cmd) return;
        return cmd.execute(interaction, ctx);
      }

      // Select menu (retrato pronto)
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId !== CUSTOM_ID.AVATAR_SELECT) return;
        const s = ctx.state.get(interaction.channelId);
        if (!s?.userId) return interaction.reply({ content: "Esse menu só funciona dentro de um ticket.", ephemeral: true });
        if (interaction.user.id !== s.userId) return interaction.reply({ content: "Esse ticket não é seu 🙂", ephemeral: true });

        const val = interaction.values?.[0];
        if (val === "none") {
          s.character.avatarUrl = "";
          ctx.state.set(interaction.channelId, s);
          return interaction.reply({ content: "✅ Retrato removido.", ephemeral: true });
        }

        s.character.avatarUrl = val;
        ctx.state.set(interaction.channelId, s);
        return interaction.reply({ content: "✅ Retrato definido! (vai aparecer no resumo/ficha)", ephemeral: true });
      }

      // Buttons
      if (interaction.isButton()) {
        const { flow, state } = ctx;
        const cid = interaction.customId;

        const s = state.get(interaction.channelId);
        if (s?.userId && interaction.user.id !== s.userId) {
          return interaction.reply({ content: "Esse ticket não é seu 🙂", ephemeral: true });
        }

        if (cid === CUSTOM_ID.CREATE_START) {
          const st = s || { step: 0, character: {}, userId: interaction.user.id };
          state.set(interaction.channelId, st);
          await interaction.showModal(flow.step1Modal(st.character));
          return;
        }

        if (cid === CUSTOM_ID.AVATAR_PICK) {
          const st = s || { step: 0, character: {}, userId: interaction.user.id };
          state.set(interaction.channelId, st);

          const retratos = ctx.rpgConfig?.retratos || [];
          return interaction.reply({
            embeds: [flow.avatarPickerEmbed(st.character.avatarUrl)],
            components: [flow.avatarSelectMenu(retratos)],
            ephemeral: true
          });
        }

        if (cid === CUSTOM_ID.AVATAR_LINK) {
          const st = s || { step: 0, character: {}, userId: interaction.user.id };
          state.set(interaction.channelId, st);
          await interaction.showModal(flow.avatarLinkModal(st.character.avatarUrl || ""));
          return;
        }

        if (cid === CUSTOM_ID.NEXT_2) {
          if (!s?.character?.nome) {
            return interaction.reply({ content: "Não achei a Etapa 1. Clique em **Começar**.", ephemeral: true });
          }
          await interaction.showModal(flow.step2Modal(s.character));
          return;
        }

        if (cid === CUSTOM_ID.NEXT_3) {
          if (!s?.character?.origem) {
            return interaction.reply({ content: "Não achei a Etapa 2. Clique em **Continuar → Etapa 2**.", ephemeral: true });
          }
          await interaction.showModal(flow.step3Modal(s.character));
          return;
        }

        if (cid === CUSTOM_ID.CONFIRM) {
          if (!s?.character?.nome) {
            return interaction.reply({ content: "Não achei seus dados. Clique em **Começar** novamente.", ephemeral: true });
          }
          const { storage } = ctx;
          const userId = s.userId;
          const character = {
            ...s.character,
            userId,
            updatedAt: new Date().toISOString()
          };
          storage.saveCharacter(userId, character);

          await interaction.reply({ content: "✅ Ficha salva! Este ticket será apagado automaticamente.", ephemeral: true });
          ctx.deleteTicket(interaction.channel, ctx.config.ticketAutoDeleteMinutes);
          return;
        }

        if (cid === CUSTOM_ID.CANCEL) {
          await interaction.reply({ content: "Cancelado. Este ticket será apagado automaticamente.", ephemeral: true });
          ctx.deleteTicket(interaction.channel, 1);
          return;
        }
      }

      // Modals
      if (interaction.isModalSubmit()) {
        const { flow, state } = ctx;
        const cid = interaction.customId;
        const s = state.get(interaction.channelId) || { step: 0, character: {}, userId: interaction.user.id };

        if (s?.userId && interaction.user.id !== s.userId) {
          return interaction.reply({ content: "Esse ticket não é seu 🙂", ephemeral: true });
        }

        if (cid === CUSTOM_ID.AVATAR_LINK_MODAL) {
          const url = interaction.fields.getTextInputValue("url").trim();
          if (!isLikelyImageUrl(url)) {
            return interaction.reply({
              content: "Esse link não parece ser uma imagem válida. Use um link https:// que termine com .png/.jpg/.jpeg/.gif/.webp (ou CDN do Discord).",
              ephemeral: true
            });
          }
          s.character.avatarUrl = url;
          state.set(interaction.channelId, s);
          return interaction.reply({ content: "✅ Retrato definido por link!", ephemeral: true });
        }

        if (cid === CUSTOM_ID.MODAL_STEP1) {
          const nome = interaction.fields.getTextInputValue("nome").trim();
          const idadeRaw = interaction.fields.getTextInputValue("idade").trim();
          const conceito = interaction.fields.getTextInputValue("conceito").trim();
          const historia = (interaction.fields.getTextInputValue("historia") || "").trim();

          const idade = parseInt(idadeRaw, 10);
          if (!Number.isFinite(idade) || idade <= 0 || idade > 999) {
            return interaction.reply({ content: "Idade inválida. Tente novamente (ex: 19).", ephemeral: true });
          }

          s.character = { ...s.character, nome, idade: String(idade), conceito, historia };
          s.step = 1;
          s.userId = s.userId || interaction.user.id;
          state.set(interaction.channelId, s);

          return interaction.reply({
            content: "Etapa 1/3 ok ✅ Clique abaixo para continuar para a Etapa 2/3 (ou escolha um retrato).",
            ephemeral: true,
            components: [flow.continueToStep2Buttons()]
          });
        }

        if (cid === CUSTOM_ID.MODAL_STEP2) {
          const origem = interaction.fields.getTextInputValue("origem").trim();
          const raca = interaction.fields.getTextInputValue("raca").trim();
          const classe = interaction.fields.getTextInputValue("classe").trim();

          s.character = { ...s.character, origem, raca, classe };
          s.step = 2;
          s.userId = s.userId || interaction.user.id;
          state.set(interaction.channelId, s);

          return interaction.reply({
            content: "Etapa 2/3 ok ✅ Clique abaixo para continuar para a Etapa 3/3 (ou escolha um retrato).",
            ephemeral: true,
            components: [flow.continueToStep3Buttons()]
          });
        }

        if (cid === CUSTOM_ID.MODAL_STEP3) {
          const runas = interaction.fields.getTextInputValue("runas").trim();
          const maestrias = interaction.fields.getTextInputValue("maestrias")?.trim() || "";
          const emprego = interaction.fields.getTextInputValue("emprego")?.trim() || "";

          s.character = { ...s.character, runas, maestrias, emprego };
          s.step = 3;
          s.userId = s.userId || interaction.user.id;
          state.set(interaction.channelId, s);

          await interaction.reply({ content: "Etapa 3/3 ok ✅ Gerando resumo…", ephemeral: true });

          await interaction.channel.send({
            embeds: [flow.summaryEmbed(s.character, interaction.user)],
            components: [flow.confirmButtons()]
          });

          if (s.character.historia && s.character.historia.length > 1200) {
            const buf = Buffer.from(s.character.historia, "utf8");
            await interaction.channel.send({ content: "📜 História (arquivo):", files: [{ attachment: buf, name: `historia-${interaction.user.id}.txt` }] });
          }

          return;
        }
      }
    } catch (e) {
      log(`Erro em interactionCreate: ${e?.stack || e}`);
      try {
        if (interaction.isRepliable() && !interaction.replied) {
          await interaction.reply({ content: "Deu um erro aqui 😥. Tenta de novo ou chama um ADM.", ephemeral: true });
        }
      } catch {}
    }
  }
};
