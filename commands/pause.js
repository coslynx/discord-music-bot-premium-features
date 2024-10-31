const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the currently playing music'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();

    try {
      await musicService.pause(interaction.guild);
      interaction.reply({ content: 'Music paused.', ephemeral: true });
    } catch (error) {
      console.error('Error pausing music:', error);
      interaction.reply({ content: 'An error occurred while pausing the music.', ephemeral: true });
    }
  },
};