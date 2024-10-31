const { Client, IntentsBitField } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const { LavalinkNode, PlayerManager } = require('lavalink');
const { PremiumService } = require('../services/premiumService');

module.exports = {
  data: {
    name: '247',
    description: 'Enable 24/7 music playback in this voice channel.',
  },
  execute: async (interaction) => {
    if (!interaction.member.voice.channel) {
      return interaction.reply({ content: 'You must be in a voice channel to use this command.', ephemeral: true });
    }

    if (!interaction.guild.members.me.voice.channel) {
      return interaction.reply({ content: 'I am not in a voice channel.', ephemeral: true });
    }

    if (!interaction.member.voice.channel.equals(interaction.guild.members.me.voice.channel)) {
      return interaction.reply({ content: 'You need to be in the same voice channel as me to use this command.', ephemeral: true });
    }

    const premiumService = new PremiumService();
    const isPremium = await premiumService.checkPremium(interaction.user.id);

    if (!isPremium) {
      return interaction.reply({ content: 'This command is only available to premium users.', ephemeral: true });
    }

    const guildId = interaction.guild.id;
    const playerManager = new PlayerManager({
      nodes: [
        new LavalinkNode({
          id: 'main',
          host: process.env.LAVALINK_HOST,
          port: process.env.LAVALINK_PORT || 2333,
          password: process.env.LAVALINK_PASSWORD,
          secure: false,
        }),
      ],
    });

    const player = playerManager.create({
      guildId,
      voiceChannel: interaction.member.voice.channel,
      textChannel: interaction.channel,
      deaf: false,
      autoSelfDeaf: true,
      volume: 100,
      leaveOnEmpty: false,
      noSubscriberBehavior: NoSubscriberBehavior.Pause,
    });

    player.play(createAudioResource(createAudioPlayer()));
    player.on('stateChange', (newState, oldState) => {
      if (newState.status === 'idle' && !oldState.status === 'idle') {
        interaction.reply({ content: 'Music playback has stopped. Please play something else.', ephemeral: true });
      }
    });

    interaction.reply({ content: '24/7 music playback enabled for this voice channel.', ephemeral: true });
  },
};