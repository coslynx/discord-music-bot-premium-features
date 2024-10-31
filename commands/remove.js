const { SlashCommandBuilder } = require('discord.js');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove a song from the music queue')
    .addIntegerOption((option) =>
      option
        .setName('position')
        .setDescription('The position of the song in the queue (starting from 1)')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const queueService = new QueueService();
    const position = interaction.options.getInteger('position');

    try {
      const removedSong = queueService.removeFromQueue(interaction.guild.id, position);

      if (!removedSong) {
        return interaction.reply({ content: 'Invalid song position.', ephemeral: true });
      }

      interaction.reply({ content: `Removed song: ${removedSong.title}`, ephemeral: true });
    } catch (error) {
      console.error('Error removing song:', error);
      interaction.reply({ content: 'An error occurred while removing the song.', ephemeral: true });
    }
  },
};