const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or add it to the queue')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name or URL of the song to play')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
    }

    const queueService = new QueueService();
    const musicService = new MusicService();
    const songNameOrUrl = interaction.options.getString('song');

    try {
      const song = await musicService.findSong(songNameOrUrl);

      if (!song) {
        return interaction.reply({ content: `No song found matching "${songNameOrUrl}".`, ephemeral: true });
      }

      if (!interaction.guild.members.me.voice.channel) {
        await musicService.join(interaction.guild, interaction.member.voice.channel);
      }

      await musicService.play(interaction.guild, song.url, interaction.channel);
      queueService.addToQueue(interaction.guild.id, song);

      interaction.reply({ content: `Playing ${song.title}.`, ephemeral: true });
    } catch (error) {
      console.error('Error playing song:', error);
      interaction.reply({ content: 'An error occurred while playing the song.', ephemeral: true });
    }
  },
};