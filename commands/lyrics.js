const { SlashCommandBuilder } = require('discord.js');
const { LyricsService } = require('../services/lyricsService');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Get lyrics for the current song.'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    const currentSong = musicService.getCurrentSong(interaction.guild);

    if (!currentSong) {
      return interaction.reply({ content: 'There is no song currently playing.', ephemeral: true });
    }

    const lyricsService = new LyricsService();

    try {
      const lyrics = await lyricsService.getLyrics(currentSong.title, currentSong.artist);

      if (!lyrics) {
        return interaction.reply({ content: 'Lyrics not found for this song.', ephemeral: true });
      }

      const embed = {
        color: 0x0099ff,
        title: `Lyrics for ${currentSong.title} by ${currentSong.artist}`,
        description: lyrics.trim(),
      };

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error getting lyrics for ${currentSong.title}:`, error);
      interaction.reply({ content: 'An error occurred while retrieving lyrics.', ephemeral: true });
    }
  },
};