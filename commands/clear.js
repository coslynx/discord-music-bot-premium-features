const { SlashCommandBuilder } = require('discord.js');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear the music queue'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const queueService = new QueueService();
    try {
      queueService.clearQueue(interaction.guild.id);
      interaction.reply({ content: 'Queue cleared!', ephemeral: true });
    } catch (error) {
      console.error('Error clearing queue:', error);
      interaction.reply({ content: 'An error occurred while clearing the queue.', ephemeral: true });
    }
  },
};