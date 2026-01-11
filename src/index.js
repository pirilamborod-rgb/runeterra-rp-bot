require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");

const botConfig = require("../config/bot.json");
const rpgConfig = require("../config/rpg.json");
const flow = require("./services/characterFlow");
const storage = require("./utils/storage");
const { log } = require("./utils/logger");
const { createTicketChannel, deleteChannelLater } = require("./services/ticketService");
const runepoints = require("./services/runepointsService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
});

// expõe config para eventos que recebem apenas (client)
client.config = botConfig;

client.on("error", (err) => log(`Client error: ${err?.message || err}`));

// Load slash commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands", "slash");
for (const file of fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"))) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
}

// Load events
const eventsPath = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"))) {
  const event = require(path.join(eventsPath, file));
  if (event.once) client.once(event.name, (...args) => event.execute(...args));
  else client.on(event.name, (...args) => event.execute(...args, ctxForEvents()));
}

function ctxForEvents() {
  return {
    commands: client.commands,
    rpgConfig,
    runepoints,
    flow,
    storage,
    config: botConfig,
    state: ticketState,
    createTicketAndStartFlow,
    deleteTicket,
    deleteTicketService: deleteChannelLater
  };
}

// Simple in-memory per-ticket state
const ticketState = new Map(); // key: channelId -> { step, userId, character }

async function createTicketAndStartFlow(guild, user) {
  const ch = await createTicketChannel({
    guild,
    user,
    categoryId: botConfig.ticketCategoryId || null,
    reason: "Criação de personagem"
  });

  // init state
  ticketState.set(ch.id, { step: 0, userId: user.id, character: {} });

  await ch.send({ content: `<@${user.id}>`, embeds: [flow.introEmbed()], components: [flow.startButtons()] });
  // auto delete fallback (in case user abandons)
  deleteTicket(ch, botConfig.ticketAutoDeleteMinutes);
}

function deleteTicket(channel, minutes) {
  deleteChannelLater(channel, minutes, (msg) => log(msg));
}

client.login(process.env.DISCORD_TOKEN);
