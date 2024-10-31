const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about the bot'),
  execute(interaction) {
    interaction.reply({
      content: 'This is a Discord music bot designed to provide an immersive and engaging music experience.',
      ephemeral: true,
    });
  },
};