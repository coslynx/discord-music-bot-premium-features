const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  execute(interaction) {
    interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};