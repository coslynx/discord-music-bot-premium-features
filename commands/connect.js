const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect')
    .setDescription('Connect the bot to a specific server.')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('The server you want to connect to (enter server name).')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const serverName = interaction.options.getString('server');
    const guild = interaction.client.guilds.cache.find((guild) => guild.name.toLowerCase() === serverName.toLowerCase());

    if (!guild) {
      return interaction.reply({ content: `No server found with the name "${serverName}".`, ephemeral: true });
    }

    try {
      await guild.fetch();
      interaction.reply({ content: `Successfully connected to server "${serverName}".`, ephemeral: true });
    } catch (error) {
      console.error(`Error connecting to server "${serverName}":`, error);
      interaction.reply({ content: `An error occurred while connecting to "${serverName}".`, ephemeral: true });
    }
  },
};