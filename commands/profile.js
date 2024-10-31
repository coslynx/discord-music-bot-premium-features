const { SlashCommandBuilder } = require('discord.js');
const { UserService } = require('../services/userService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View and manage your profile.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('view')
        .setDescription('View your profile information.')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('edit')
        .setDescription('Edit your profile information.')
        .addStringOption((option) =>
          option
            .setName('name')
            .setDescription('Your desired display name.')
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName('genres')
            .setDescription('Your favorite music genres, separated by commas.')
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName('theme')
            .setDescription('Choose a theme for your profile.')
            .setRequired(false)
            .addChoices(
              { name: 'Light', value: 'light' },
              { name: 'Dark', value: 'dark' }
            )
        )
    ),
  execute: async (interaction) => {
    const userService = new UserService();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      try {
        const user = await userService.getUser(interaction.user.id);
        const embed = {
          color: 0x0099ff,
          title: `Profile for ${user.username}`,
          fields: [
            { name: 'Display Name', value: user.displayName || 'N/A' },
            { name: 'Favorite Genres', value: user.favoriteGenres || 'N/A' },
            { name: 'Theme', value: user.theme || 'N/A' },
          ],
        };
        interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        interaction.reply({ content: 'An error occurred while fetching your profile.', ephemeral: true });
      }
    } else if (subcommand === 'edit') {
      const displayName = interaction.options.getString('name');
      const favoriteGenres = interaction.options.getString('genres');
      const theme = interaction.options.getString('theme');

      try {
        await userService.updateUser(interaction.user.id, {
          displayName,
          favoriteGenres,
          theme,
        });
        interaction.reply({ content: 'Profile updated successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error updating user profile:', error);
        interaction.reply({ content: 'An error occurred while updating your profile.', ephemeral: true });
      }
    }
  },
};