const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    const queueService = new QueueService();

    try {
      const skippedSong = await musicService.skip(interaction.guild);
      interaction.reply({ content: `Skipped ${skippedSong.title}.`, ephemeral: true });
    } catch (error) {
      console.error('Error skipping song:', error);
      interaction.reply({ content: 'An error occurred while skipping the song.', ephemeral: true });
    }
  },
};