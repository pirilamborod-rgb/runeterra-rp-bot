const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

function safeReadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function isAdmin(interaction, ctx) {
  const roleId = String(ctx.config.adminRoleId || "").trim();
  if (roleId) return interaction.member?.roles?.cache?.has(roleId);
  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin_fichas")
    .setDescription("Admin: ver fichas salvas (listar / ver / procurar / exportar).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sc =>
      sc.setName("listar")
        .setDescription("Lista as fichas salvas (até 20 por página).")
        .addIntegerOption(o => o.setName("pagina").setDescription("Página (1, 2, 3...)").setMinValue(1))
    )
    .addSubcommand(sc =>
      sc.setName("ver")
        .setDescription("Mostra a ficha de um jogador.")
        .addUserOption(o => o.setName("usuario").setDescription("Selecione o usuário").setRequired(true))
    )
    .addSubcommand(sc =>
      sc.setName("ver_id")
        .setDescription("Mostra a ficha de um jogador (por ID numérico).")
        .addStringOption(o => o.setName("user_id").setDescription("ID do jogador (17-20 dígitos)").setRequired(true))
    )
    .addSubcommand(sc =>
      sc.setName("procurar")
        .setDescription("Procura fichas pelo nome do personagem (contém).")
        .addStringOption(o => o.setName("nome").setDescription("Ex: 'Akali'").setRequired(true))
    )
    .addSubcommand(sc =>
      sc.setName("exportar")
        .setDescription("Exporta todas as fichas em um JSON.")
    ),
  async execute(interaction, ctx) {
    if (!isAdmin(interaction, ctx)) {
      return interaction.reply({ content: "Você não tem permissão para usar esse comando.", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const dir = path.join(process.cwd(), "data", "personagens");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

    if (sub === "listar") {
      const page = interaction.options.getInteger("pagina") || 1;
      const pageSize = 20;
      const start = (page - 1) * pageSize;
      const slice = files.slice(start, start + pageSize);

      if (slice.length === 0) {
        return interaction.reply({ content: `Sem fichas nessa página. Total de fichas: ${files.length}`, ephemeral: true });
      }

      const lines = slice.map((f, i) => {
        const userId = f.replace(".json", "");
        const data = safeReadJson(path.join(dir, f));
        return `${start + i + 1}. **${data?.nome || "Sem nome"}** — <@${userId}> (\`${userId}\`)`;
      });

      return interaction.reply({
        content: `**Fichas (página ${page})** — total: ${files.length}\n` + lines.join("\n"),
        ephemeral: true
      });
    }

    function renderFicha(userId) {
      const p = path.join(dir, `${userId}.json`);
      if (!fs.existsSync(p)) return null;

      const ch = safeReadJson(p);
      if (!ch) return { error: "Arquivo de ficha está inválido/corrompido." };

      const lines = [
        `**Jogador:** <@${userId}> (\`${userId}\`)`,
        `**Nome:** ${ch.nome} (${ch.idade})`,
        `**Conceito:** ${ch.conceito}`,
        ch.historia ? `**História:** ${ch.historia}` : "**História:** —",
        `**Origem:** ${ch.origem} | **Raça:** ${ch.raca} | **Classe:** ${ch.classe}`,
        `**Runas:** ${ch.runas}`,
        `**Maestrias:** ${ch.maestrias || "—"}`,
        `**Emprego:** ${ch.emprego || "—"}`,
        ch.avatarUrl ? `**Retrato:** ${ch.avatarUrl}` : ""
      ].filter(Boolean);

      return { text: lines.join("\n") };
    }

    if (sub === "ver") {
      const user = interaction.options.getUser("usuario");
      const res = renderFicha(user.id);
      if (!res) return interaction.reply({ content: "Não achei ficha pra esse usuário. (Dica: ele precisa finalizar e clicar em **Confirmar e salvar**.)", ephemeral: true });
      if (res.error) return interaction.reply({ content: res.error, ephemeral: true });

      if (res.text.length > 1800) {
        const buf = Buffer.from(res.text, "utf8");
        return interaction.reply({ content: "Ficha é grande; enviei como arquivo:", files: [{ attachment: buf, name: `ficha-${user.id}.txt` }], ephemeral: true });
      }
      return interaction.reply({ content: res.text, ephemeral: true });
    }

    if (sub === "ver_id") {
      const userId = interaction.options.getString("user_id").trim();
      if (!/^\d{17,20}$/.test(userId)) {
        return interaction.reply({ content: "Esse não parece um ID válido. Tem que ser um número de 17 a 20 dígitos.", ephemeral: true });
      }
      const res = renderFicha(userId);
      if (!res) return interaction.reply({ content: "Não achei ficha para esse ID.", ephemeral: true });
      if (res.error) return interaction.reply({ content: res.error, ephemeral: true });

      if (res.text.length > 1800) {
        const buf = Buffer.from(res.text, "utf8");
        return interaction.reply({ content: "Ficha é grande; enviei como arquivo:", files: [{ attachment: buf, name: `ficha-${userId}.txt` }], ephemeral: true });
      }
      return interaction.reply({ content: res.text, ephemeral: true });
    }

    if (sub === "procurar") {
      const q = interaction.options.getString("nome").toLowerCase().trim();
      const hits = [];
      for (const f of files) {
        const userId = f.replace(".json", "");
        const data = safeReadJson(path.join(dir, f));
        const nome = (data?.nome || "").toLowerCase();
        if (nome.includes(q)) hits.push({ userId, nome: data?.nome || "Sem nome" });
      }
      if (hits.length === 0) return interaction.reply({ content: "Nenhuma ficha encontrada com esse nome.", ephemeral: true });

      const lines = hits.slice(0, 20).map((h, i) => `${i + 1}. **${h.nome}** — <@${h.userId}> (\`${h.userId}\`)`);
      const extra = hits.length > 20 ? `\n(+${hits.length - 20} resultados)` : "";
      return interaction.reply({ content: `Resultados:\n` + lines.join("\n") + extra, ephemeral: true });
    }

    if (sub === "exportar") {
      const all = [];
      for (const f of files) {
        const data = safeReadJson(path.join(dir, f));
        if (data) all.push(data);
      }
      const payload = Buffer.from(JSON.stringify(all, null, 2), "utf8");
      return interaction.reply({ content: "Exportação em JSON (lista de fichas):", files: [{ attachment: payload, name: "fichas-export.json" }], ephemeral: true });
    }
  }
};
