const { ChannelType, PermissionFlagsBits } = require("discord.js");

function isSnowflake(id) {
  // Discord snowflake é um número grande em string (normalmente 17-19 dígitos)
  return typeof id === "string" && /^\d{17,20}$/.test(id);
}

async function createTicketChannel({ guild, user, categoryId, reason = "Criação de personagem" }) {
  const overwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel]
    },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.EmbedLinks
      ]
    },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ReadMessageHistory
      ]
    }
  ];

  const name = `ticket-${user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 90);

  const payload = {
    name,
    type: ChannelType.GuildText,
    topic: `Ticket de ${user.tag} (${user.id}) — ${reason}`,
    permissionOverwrites: overwrites
  };

  // Só define parent se o ID for válido
  if (isSnowflake(categoryId)) {
    payload.parent = categoryId;
  }

  const channel = await guild.channels.create(payload);
  return channel;
}

async function deleteChannelLater(channel, minutes, logger) {
  const ms = Math.max(1, minutes) * 60 * 1000;
  setTimeout(async () => {
    try {
      await channel.delete("Auto-delete do ticket após criação de personagem");
      logger?.(`Ticket deletado automaticamente: ${channel.id}`);
    } catch (e) {
      logger?.(`Falha ao deletar ticket ${channel.id}: ${e?.message || e}`);
    }
  }, ms);
}

module.exports = { createTicketChannel, deleteChannelLater, isSnowflake };
