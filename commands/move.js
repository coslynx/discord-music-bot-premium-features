const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Move the bot to a different voice channel.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The voice channel to move to.')
        .setRequired(true)
        .addChannelTypes(4) // Channel type: voice
    ),
  execute: async (interaction) => {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
    }

    const targetChannel = interaction.options.getChannel('channel');
    if (!targetChannel) {
      return interaction.reply({ content: 'Invalid voice channel.', ephemeral: true });
    }

    const musicService = new MusicService();
    try {
      await musicService.move(interaction.guild, targetChannel);
      interaction.reply({ content: `Moved to ${targetChannel.name}.`, ephemeral: true });
    } catch (error) {
      console.error(`Error moving to channel ${targetChannel.name}:`, error);
      interaction.reply({ content: `An error occurred while moving to ${targetChannel.name}.`, ephemeral: true });
    }
  },
};