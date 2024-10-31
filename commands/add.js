const { SlashCommandBuilder } = require('discord.js');
const { QueueService } = require('../services/queueService');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add a song to the music queue')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name or URL of the song to add')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const queueService = new QueueService();
    const musicService = new MusicService();
    const songNameOrUrl = interaction.options.getString('song');

    try {
      const song = await musicService.findSong(songNameOrUrl);

      if (!song) {
        return interaction.reply({ content: `No song found matching \"${songNameOrUrl}\".`, ephemeral: true });
      }

      if (!interaction.guild.members.me.voice.channel) {
        await musicService.join(interaction.guild, interaction.member.voice.channel);
      }

      await musicService.play(interaction.guild, song.url, interaction.channel);
      queueService.addToQueue(interaction.guild.id, song);

      interaction.reply({ content: `Added ${song.title} to the queue.`, ephemeral: true });
    } catch (error) {
      console.error('Error adding song:', error);
      interaction.reply({ content: 'An error occurred while adding the song.', ephemeral: true });
    }
  },
};