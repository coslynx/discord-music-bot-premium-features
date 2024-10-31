const { SlashCommandBuilder } = require('discord.js');
const { PlaylistService } = require('../services/playlistService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createplaylist')
    .setDescription('Create a new playlist.')
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('The name of the playlist.')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const playlistName = interaction.options.getString('name');
    const playlistService = new PlaylistService();

    try {
      await playlistService.createPlaylist(interaction.user.id, playlistName);
      interaction.reply({ content: `Created playlist \"${playlistName}\".`, ephemeral: true });
    } catch (error) {
      console.error(`Error creating playlist \"${playlistName}\":`, error);
      interaction.reply({ content: `An error occurred while creating playlist \"${playlistName}\".`, ephemeral: true });
    }
  },
};