const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leave the current voice channel.'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    try {
      await musicService.leave(interaction.guild);
      interaction.reply({ content: 'Left the voice channel.', ephemeral: true });
    } catch (error) {
      console.error('Error leaving voice channel:', error);
      interaction.reply({ content: 'An error occurred while leaving the voice channel.', ephemeral: true });
    }
  },
};