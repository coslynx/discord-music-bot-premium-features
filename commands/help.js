const { SlashCommandBuilder } = require('discord.js');
const { commands } = require('../utils/commandHandler');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),
  execute(interaction) {
    const availableCommands = commands.map((command) => `/${command.data.name}`);
    interaction.reply({
      content: `Available commands: ${availableCommands.join(', ')}`,
      ephemeral: true,
    });
  },
};