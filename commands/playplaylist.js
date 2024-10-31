const { SlashCommandBuilder } = require('discord.js');
const { PlaylistService } = require('../services/playlistService');
const { MusicService } = require('../services/musicService');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playplaylist')
    .setDescription('Play a playlist.')
    .addStringOption((option) =>
      option
        .setName('playlist')
        .setDescription('The name of the playlist to play.')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
    }

    const playlistName = interaction.options.getString('playlist');
    const playlistService = new PlaylistService();
    const musicService = new MusicService();
    const queueService = new QueueService();

    try {
      const playlist = await playlistService.getPlaylistByName(interaction.user.id, playlistName);

      if (!playlist) {
        return interaction.reply({ content: `Playlist "${playlistName}" not found.`, ephemeral: true });
      }

      if (!interaction.guild.members.me.voice.channel) {
        await musicService.join(interaction.guild, interaction.member.voice.channel);
      }

      for (const song of playlist.songs) {
        try {
          await musicService.play(interaction.guild, song.url, interaction.channel);
          queueService.addToQueue(interaction.guild.id, song);
        } catch (error) {
          console.error(`Error playing song from playlist "${playlistName}":`, error);
          interaction.reply({ content: `An error occurred while playing a song from the playlist "${playlistName}".`, ephemeral: true });
        }
      }

      interaction.reply({ content: `Playing playlist "${playlistName}".`, ephemeral: true });
    } catch (error) {
      console.error(`Error getting playlist "${playlistName}":`, error);
      interaction.reply({ content: `An error occurred while getting playlist "${playlistName}".`, ephemeral: true });
    }
  },
};