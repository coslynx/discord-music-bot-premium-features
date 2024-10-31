const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Join the voice channel you are in.')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The voice channel to join.')
        .setRequired(false)
        .addChannelTypes(4) // Channel type: voice
    ),
  execute: async (interaction) => {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
    }

    const musicService = new MusicService();
    const targetChannel = interaction.options.getChannel('channel') || interaction.member.voice.channel;

    try {
      await musicService.join(interaction.guild, targetChannel);
      interaction.reply({ content: `Joined ${targetChannel.name}.`, ephemeral: true });
    } catch (error) {
      console.error('Error joining voice channel:', error);
      interaction.reply({ content: 'An error occurred while joining the voice channel.', ephemeral: true });
    }
  },
};