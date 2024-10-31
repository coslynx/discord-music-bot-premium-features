const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');
const { PlaylistService } = require('../services/playlistService');
const { UserService } = require('../services/userService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recommend')
    .setDescription('Get music recommendations based on your preferences.')
    .addStringOption((option) =>
      option
        .setName('genre')
        .setDescription('Specify a genre for recommendations (optional).')
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const genre = interaction.options.getString('genre');
    const musicService = new MusicService();
    const userService = new UserService();
    const playlistService = new PlaylistService();

    try {
      const user = await userService.getUser(interaction.user.id);

      let recommendations;
      if (genre) {
        recommendations = await musicService.getRecommendationsByGenre(genre);
      } else {
        recommendations = await musicService.getRecommendationsByUser(user);
      }

      if (recommendations.length === 0) {
        return interaction.reply({ content: 'No recommendations found.', ephemeral: true });
      }

      const embed = {
        color: 0x0099ff,
        title: 'Here are some recommendations for you:',
        fields: recommendations.map((song) => ({
          name: song.title,
          value: `By ${song.artist} - [${song.url}](${song.url})`,
          inline: true,
        })),
      };

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      interaction.reply({ content: 'An error occurred while retrieving recommendations.', ephemeral: true });
    }
  },
};