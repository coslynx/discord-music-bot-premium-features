const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the currently playing song'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    const currentSong = musicService.getCurrentSong(interaction.guild);

    if (!currentSong) {
      return interaction.reply({ content: 'There is no song currently playing.', ephemeral: true });
    }

    const embed = {
      color: 0x0099ff,
      title: `Now Playing: ${currentSong.title}`,
      fields: [
        { name: 'Artist', value: currentSong.artist, inline: true },
        { name: 'Duration', value: musicService.formatDuration(currentSong.duration), inline: true },
      ],
    };

    interaction.reply({ embeds: [embed] });
  },
};