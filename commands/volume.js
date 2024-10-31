const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Set the volume of the music player.')
    .addIntegerOption((option) =>
      option
        .setName('volume')
        .setDescription('The volume level (0-200)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(200)
    ),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    const volume = interaction.options.getInteger('volume');

    try {
      await musicService.setVolume(interaction.guild, volume);
      interaction.reply({ content: `Volume set to ${volume}.`, ephemeral: true });
    } catch (error) {
      console.error('Error setting volume:', error);
      interaction.reply({ content: 'An error occurred while setting the volume.', ephemeral: true });
    }
  },
};