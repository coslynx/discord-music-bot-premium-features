const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Seek to a specific time in the current song')
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('The number of seconds to seek to')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    const seconds = interaction.options.getInteger('seconds');

    try {
      await musicService.seek(interaction.guild, seconds);
      interaction.reply({ content: `Seeked to ${musicService.formatDuration(seconds)} seconds.`, ephemeral: true });
    } catch (error) {
      console.error('Error seeking to specific time:', error);
      interaction.reply({ content: 'An error occurred while seeking to the specified time.', ephemeral: true });
    }
  },
};