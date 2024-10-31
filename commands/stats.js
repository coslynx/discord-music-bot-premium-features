const { SlashCommandBuilder } = require('discord.js');
const { MusicService } = require('../services/musicService');
const { QueueService } = require('../services/queueService');
const { DatabaseService } = require('../services/databaseService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View bot statistics.'),
  execute: async (interaction) => {
    const musicService = new MusicService();
    const queueService = new QueueService();
    const databaseService = new DatabaseService();

    try {
      const songPlayCount = await databaseService.getSongPlayCount();
      const queueSize = queueService.getQueueSize(interaction.guild.id);
      const serverCount = interaction.client.guilds.cache.size;

      const embed = {
        color: 0x0099ff,
        title: 'Bot Statistics',
        fields: [
          { name: 'Songs Played', value: songPlayCount.toString(), inline: true },
          { name: 'Queue Size', value: queueSize.toString(), inline: true },
          { name: 'Servers', value: serverCount.toString(), inline: true },
        ],
      };

      interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching bot statistics:', error);
      interaction.reply({ content: 'An error occurred while fetching bot statistics.', ephemeral: true });
    }
  },
};