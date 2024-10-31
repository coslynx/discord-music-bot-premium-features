const { SlashCommandBuilder } = require('discord.js');
const { PlaylistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addtoplaylist')
    .setDescription('Add a song to a playlist.')
    .addStringOption((option) =>
      option
        .setName('playlist')
        .setDescription('The name of the playlist to add to.')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name or URL of the song to add.')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const playlistName = interaction.options.getString('playlist');
    const songNameOrUrl = interaction.options.getString('song');
    const playlistService = new PlaylistService();

    try {
      await playlistService.addToPlaylist(interaction.user.id, playlistName, songNameOrUrl);
      interaction.reply({ content: `Added song to playlist \"${playlistName}\".`, ephemeral: true });
    } catch (error) {
      console.error(`Error adding song to playlist \"${playlistName}\":`, error);
      interaction.reply({ content: `An error occurred while adding a song to playlist \"${playlistName}\".`, ephemeral: true });
    }
  },
};