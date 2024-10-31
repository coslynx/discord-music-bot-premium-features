const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused music'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();

    try {
      await musicService.resume(interaction.guild);
      interaction.reply({ content: 'Resuming the music.', ephemeral: true });
    } catch (error) {
      console.error('Error resuming music:', error);
      interaction.reply({ content: 'An error occurred while resuming the music.', ephemeral: true });
    }
  },
};