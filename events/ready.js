const { Client, IntentsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const { LavalinkNode, PlayerManager } = require('lavalink');
const { commands } = require('./utils/commandHandler');
const { DatabaseService } = require('./services/databaseService');

const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildVoiceStates, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent] });

const playerManager = new PlayerManager({
  nodes: [
    new LavalinkNode({
      id: 'main',
      host: process.env.LAVALINK_HOST,
      port: process.env.LAVALINK_PORT || 2333,
      password: process.env.LAVALINK_PASSWORD,
      secure: false,
    }),
  ],
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Register slash commands
  for (const command of commands) {
    try {
      await client.application.commands.create(command.data);
    } catch (error) {
      console.error(`Error registering command ${command.data.name}:`, error);
    }
  }

  // Connect to the database
  const databaseService = new DatabaseService();
  await databaseService.connect();

  // Initialize Lavalink
  client.on('raw', (packet) => {
    if (packet.t === 'VOICE_SERVER_UPDATE') {
      playerManager.voiceServerUpdate(packet);
    } else if (packet.t === 'VOICE_STATE_UPDATE') {
      playerManager.voiceStateUpdate(packet);
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commands.find((cmd) => cmd.data.name === interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });
});

client.login(process.env.DISCORD_TOKEN);