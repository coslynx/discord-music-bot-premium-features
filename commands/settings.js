const { SlashCommandBuilder } = require('discord.js');
const { UserService } = require('../services/userService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Manage your bot settings.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('music')
        .setDescription('Configure your music settings.')
        .addStringOption((option) =>
          option
            .setName('source')
            .setDescription('Choose your preferred music source.')
            .setRequired(false)
            .addChoices(
              { name: 'Spotify', value: 'spotify' },
              { name: 'YouTube', value: 'youtube' },
              { name: 'Deezer', value: 'deezer' }
            )
        )
        .addIntegerOption((option) =>
          option
            .setName('volume')
            .setDescription('Set the default volume level.')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(200)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('notifications')
        .setDescription('Manage notification settings.')
        .addBooleanOption((option) =>
          option
            .setName('queue_updates')
            .setDescription('Receive notifications when songs are added to the queue.')
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName('playback_start')
            .setDescription('Receive notifications when playback starts.')
            .setRequired(false)
        )
        .addBooleanOption((option) =>
          option
            .setName('playback_end')
            .setDescription('Receive notifications when playback ends.')
            .setRequired(false)
        )
    ),
  execute: async (interaction) => {
    const userService = new UserService();
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'music') {
      const preferredSource = interaction.options.getString('source');
      const volume = interaction.options.getInteger('volume');

      try {
        await userService.updateUser(interaction.user.id, {
          preferredMusicSource: preferredSource,
          defaultVolume: volume,
        });
        interaction.reply({ content: 'Music settings updated successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error updating music settings:', error);
        interaction.reply({ content: 'An error occurred while updating your music settings.', ephemeral: true });
      }
    } else if (subcommand === 'notifications') {
      const queueUpdates = interaction.options.getBoolean('queue_updates');
      const playbackStart = interaction.options.getBoolean('playback_start');
      const playbackEnd = interaction.options.getBoolean('playback_end');

      try {
        await userService.updateUser(interaction.user.id, {
          queueUpdates,
          playbackStart,
          playbackEnd,
        });
        interaction.reply({ content: 'Notification settings updated successfully!', ephemeral: true });
      } catch (error) {
        console.error('Error updating notification settings:', error);
        interaction.reply({ content: 'An error occurred while updating your notification settings.', ephemeral: true });
      }
    }
  },
};