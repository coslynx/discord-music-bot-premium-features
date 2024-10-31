const { SlashCommandBuilder } = require('discord.js');
const { PlaylistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removefromplaylist')
    .setDescription('Remove a song from a playlist.')
    .addStringOption((option) =>
      option
        .setName('playlist')
        .setDescription('The name of the playlist to remove from.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name or URL of the song to remove.')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const playlistName = interaction.options.getString('playlist');
    const songNameOrUrl = interaction.options.getString('song');
    const playlistService = new PlaylistService();

    try {
      await playlistService.removeFromPlaylist(interaction.user.id, playlistName, songNameOrUrl);
      interaction.reply({ content: `Removed song from playlist "${playlistName}".`, ephemeral: true });
    } catch (error) {
      console.error(`Error removing song from playlist "${playlistName}":`, error);
      interaction.reply({ content: `An error occurred while removing a song from playlist "${playlistName}".`, ephemeral: true });
    }
  },
};