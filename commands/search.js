const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for songs.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The search query.')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const query = interaction.options.getString('query');
    const musicService = new MusicService();

    try {
      const results = await musicService.searchSongs(query);

      if (results.length === 0) {
        return interaction.reply({ content: `No results found for \"${query}\".`, ephemeral: true });
      }

      const embed = {
        color: 0x0099ff,
        title: `Search Results for \"${query}\"`,
        fields: results.slice(0, 5).map((song) => ({
          name: song.title,
          value: `By ${song.artist} - [${song.url}](${song.url})`,
          inline: true,
        })),
      };

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error searching for songs:`, error);
      interaction.reply({ content: 'An error occurred while searching for songs.', ephemeral: true });
    }
  },
};