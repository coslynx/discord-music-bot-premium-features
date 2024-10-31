const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('repeat')
    .setDescription('Repeat the current song.')
    .addIntegerOption((option) =>
      option
        .setName('times')
        .setDescription('The number of times to repeat the song.')
        .setRequired(true)
        .setMinValue(1)
    ),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const repeatTimes = interaction.options.getInteger('times');
    const musicService = new MusicService();

    try {
      musicService.setRepeat(interaction.guild, repeatTimes);
      interaction.reply({ content: `Repeating the current song ${repeatTimes} times.`, ephemeral: true });
    } catch (error) {
      console.error('Error setting repeat:', error);
      interaction.reply({ content: 'An error occurred while setting the repeat.', ephemeral: true });
    }
  },
};