const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} = require("discord.js");

const { CUSTOM_ID } = require("../utils/constants");

function introEmbed() {
  return new EmbedBuilder()
    .setTitle("Criação de Personagem — Runeterra RP")
    .setDescription(
      [
        "Vamos criar seu personagem por etapas.",
        "",
        "**Regras rápidas:**",
        "• Preencha com calma — você pode cancelar a qualquer momento.",
        "• Ao finalizar, o bot salva sua ficha e **apaga este ticket** depois.",
        "",
        "Clique em **Começar** para abrir o formulário."
      ].join("\n")
    );
}

function startButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CUSTOM_ID.CREATE_START).setLabel("Começar").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CUSTOM_ID.CANCEL).setLabel("Cancelar").setStyle(ButtonStyle.Secondary)
  );
}

function continueToStep2Buttons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CUSTOM_ID.NEXT_2).setLabel("Continuar → Etapa 2").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.AVATAR_PICK).setLabel("Retratos prontos").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.AVATAR_LINK).setLabel("Retrato por link").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.CANCEL).setLabel("Cancelar").setStyle(ButtonStyle.Danger)
  );
}

function continueToStep3Buttons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CUSTOM_ID.NEXT_3).setLabel("Continuar → Etapa 3").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.AVATAR_PICK).setLabel("Retratos prontos").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.AVATAR_LINK).setLabel("Retrato por link").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.CANCEL).setLabel("Cancelar").setStyle(ButtonStyle.Danger)
  );
}

function confirmButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(CUSTOM_ID.CONFIRM).setLabel("Confirmar e salvar").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(CUSTOM_ID.AVATAR_PICK).setLabel("Retratos prontos").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.AVATAR_LINK).setLabel("Retrato por link").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CUSTOM_ID.CANCEL).setLabel("Cancelar").setStyle(ButtonStyle.Danger)
  );
}

function avatarSelectMenu(retratos = []) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(CUSTOM_ID.AVATAR_SELECT)
    .setPlaceholder("Escolha um retrato (opcional)");

  const options = retratos.slice(0, 25).map((r, idx) => ({
    label: r.nome?.slice(0, 100) || `Retrato ${idx + 1}`,
    value: r.url
  }));

  options.unshift({ label: "Sem retrato", value: "none" });

  menu.addOptions(options);

  return new ActionRowBuilder().addComponents(menu);
}

function avatarLinkModal(currentUrl = "") {
  const modal = new ModalBuilder().setCustomId(CUSTOM_ID.AVATAR_LINK_MODAL).setTitle("Retrato por link");
  const url = new TextInputBuilder()
    .setCustomId("url")
    .setLabel("Cole o link da imagem (https://...)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(400)
    .setValue(currentUrl || "");
  modal.addComponents(new ActionRowBuilder().addComponents(url));
  return modal;
}

function step1Modal(defaults = {}) {
  const modal = new ModalBuilder().setCustomId(CUSTOM_ID.MODAL_STEP1).setTitle("Etapa 1/3 — Identidade");

  const nome = new TextInputBuilder()
    .setCustomId("nome")
    .setLabel("Nome do personagem")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(40)
    .setValue(defaults.nome || "");

  const idade = new TextInputBuilder()
    .setCustomId("idade")
    .setLabel("Idade (ex: 19)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(3)
    .setValue(defaults.idade || "");

  const conceito = new TextInputBuilder()
    .setCustomId("conceito")
    .setLabel("Conceito (1 frase): quem é você?")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(300)
    .setValue(defaults.conceito || "");

  const historia = new TextInputBuilder()
    .setCustomId("historia")
    .setLabel("História (opcional; até 4000 caracteres)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(4000)
    .setValue(defaults.historia || "");

  modal.addComponents(
    new ActionRowBuilder().addComponents(nome),
    new ActionRowBuilder().addComponents(idade),
    new ActionRowBuilder().addComponents(conceito),
    new ActionRowBuilder().addComponents(historia)
  );

  return modal;
}

function step2Modal(defaults = {}) {
  const modal = new ModalBuilder().setCustomId(CUSTOM_ID.MODAL_STEP2).setTitle("Etapa 2/3 — Mundo");

  const origem = new TextInputBuilder()
    .setCustomId("origem")
    .setLabel("Origem (ex: Demacia, Zaun...)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(30)
    .setValue(defaults.origem || "");

  const raca = new TextInputBuilder()
    .setCustomId("raca")
    .setLabel("Raça (ex: Humano, Vastaya...)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(30)
    .setValue(defaults.raca || "");

  const classe = new TextInputBuilder()
    .setCustomId("classe")
    .setLabel("Classe (ex: Mago, Guerreiro...)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(30)
    .setValue(defaults.classe || "");

  modal.addComponents(
    new ActionRowBuilder().addComponents(origem),
    new ActionRowBuilder().addComponents(raca),
    new ActionRowBuilder().addComponents(classe)
  );

  return modal;
}

function step3Modal(defaults = {}) {
  const modal = new ModalBuilder().setCustomId(CUSTOM_ID.MODAL_STEP3).setTitle("Etapa 3/3 — Build");

  const runas = new TextInputBuilder()
    .setCustomId("runas")
    .setLabel("Runas (ex: Precisão + Dominação)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(60)
    .setValue(defaults.runas || "");

  const maestrias = new TextInputBuilder()
    .setCustomId("maestrias")
    .setLabel("Maestrias (curto; pode ser vazio)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(400)
    .setValue(defaults.maestrias || "");

  const emprego = new TextInputBuilder()
    .setCustomId("emprego")
    .setLabel("Emprego (ex: mercador, guarda, caçador...)")
    .setStyle(TextInputStyle.Short)
    .setRequired(false)
    .setMaxLength(60)
    .setValue(defaults.emprego || "");

  modal.addComponents(
    new ActionRowBuilder().addComponents(runas),
    new ActionRowBuilder().addComponents(maestrias),
    new ActionRowBuilder().addComponents(emprego)
  );

  return modal;
}

function summaryEmbed(character, user) {
  const lines = [
    `**Jogador:** ${user.tag}`,
    `**Nome:** ${character.nome}`,
    `**Idade:** ${character.idade}`,
    `**Conceito:** ${character.conceito}`,
    character.historia ? `**História:** ${character.historia.length > 700 ? character.historia.slice(0, 700) + "…" : character.historia}` : "**História:** —",
    "",
    `**Origem:** ${character.origem}`,
    `**Raça:** ${character.raca}`,
    `**Classe:** ${character.classe}`,
    "",
    `**Runas:** ${character.runas}`,
    `**Maestrias:** ${character.maestrias || "—"}`,
    `**Emprego:** ${character.emprego || "—"}`
  ];

  const emb = new EmbedBuilder()
    .setTitle("Resumo da Ficha")
    .setDescription(lines.join("\n"))
    .setFooter({ text: "Se estiver tudo certo, confirme para salvar." });

  if (character.avatarUrl) emb.setThumbnail(character.avatarUrl);
  return emb;
}

function avatarPickerEmbed(currentUrl) {
  const emb = new EmbedBuilder()
    .setTitle("Escolha um retrato")
    .setDescription(
      [
        "• Você pode escolher um retrato pronto **ou** definir um por link.",
        "• **Sem retrato** remove o retrato atual."
      ].join("\n")
    );
  if (currentUrl) emb.setThumbnail(currentUrl);
  return emb;
}

module.exports = {
  introEmbed,
  startButtons,
  continueToStep2Buttons,
  continueToStep3Buttons,
  confirmButtons,
  avatarSelectMenu,
  avatarPickerEmbed,
  avatarLinkModal,
  step1Modal,
  step2Modal,
  step3Modal,
  summaryEmbed
};
