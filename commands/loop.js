const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Loop the current song or the entire queue.')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('The loop mode to enable.')
        .setRequired(true)
        .addChoices(
          { name: 'Song', value: 'song' },
          { name: 'Queue', value: 'queue' },
          { name: 'Off', value: 'off' }
        )
    ),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const loopMode = interaction.options.getString('mode');
    const musicService = new MusicService();

    try {
      if (loopMode === 'song') {
        musicService.setLoopMode(interaction.guild, 'song');
        interaction.reply({ content: 'Looping the current song.', ephemeral: true });
      } else if (loopMode === 'queue') {
        musicService.setLoopMode(interaction.guild, 'queue');
        interaction.reply({ content: 'Looping the entire queue.', ephemeral: true });
      } else {
        musicService.setLoopMode(interaction.guild, 'off');
        interaction.reply({ content: 'Looping disabled.', ephemeral: true });
      }
    } catch (error) {
      console.error('Error setting loop mode:', error);
      interaction.reply({ content: 'An error occurred while setting the loop mode.', ephemeral: true });
    }
  },
};