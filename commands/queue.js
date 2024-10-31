const { SlashCommandBuilder } = require('discord.js');
const { QueueService } = require('../services/queueService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the current music queue'),
  execute: async (interaction) => {
    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    const queueService = new QueueService();
    const queue = queueService.getQueue(interaction.guild.id);

    if (queue.length === 0) {
      return interaction.reply({ content: 'The queue is empty.', ephemeral: true });
    }

    const queueString = queue.map((song, index) => `${index + 1}. ${song.title} - ${song.artist}`).join('\n');

    const embed = {
      color: 0x0099ff,
      title: 'Music Queue',
      description: queueString,
    };

    interaction.reply({ embeds: [embed] });
  },
};