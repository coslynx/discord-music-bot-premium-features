const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the music and clear the queue'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    const queueService = new QueueService();

    try {
      await musicService.stop(interaction.guild);
      queueService.clearQueue(interaction.guild.id);
      interaction.reply({ content: 'Stopped the music and cleared the queue.', ephemeral: true });
    } catch (error) {
      console.error('Error stopping music and clearing queue:', error);
      interaction.reply({ content: 'An error occurred while stopping the music and clearing the queue.', ephemeral: true });
    }
  },
};