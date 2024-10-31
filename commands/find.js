const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('find')
    .setDescription('Find a specific song.')
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name or URL of the song to find.')
        .setRequired(true)
    ),
  execute: async (interaction) => {
    const songNameOrUrl = interaction.options.getString('song');
    const musicService = new MusicService();

    try {
      const song = await musicService.findSong(songNameOrUrl);

      if (!song) {
        return interaction.reply({ content: `No song found matching "${songNameOrUrl}".`, ephemeral: true });
      }

      const embed = {
        color: 0x0099ff,
        title: song.title,
        fields: [
          { name: 'Artist', value: song.artist, inline: true },
          { name: 'Duration', value: musicService.formatDuration(song.duration), inline: true },
          { name: 'URL', value: `[${song.url}](${song.url})`, inline: true },
        ],
      };

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(`Error finding song "${songNameOrUrl}":`, error);
      interaction.reply({ content: `An error occurred while searching for the song.`, ephemeral: true });
    }
  },
};