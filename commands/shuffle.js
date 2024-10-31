const { SlashCommandBuilder } = require('discord.js');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('Shuffle the music queue'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const queueService = new QueueService();
    try {
      queueService.shuffleQueue(interaction.guild.id);
      interaction.reply({ content: 'Queue shuffled!', ephemeral: true });
    } catch (error) {
      console.error('Error shuffling queue:', error);
      interaction.reply({ content: 'An error occurred while shuffling the queue.', ephemeral: true });
    }
  },
};