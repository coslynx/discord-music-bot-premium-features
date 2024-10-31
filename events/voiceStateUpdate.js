const { MusicService } = require('../services/musicService');

module.exports = {
  name: 'voiceStateUpdate',
  once: false,
  execute: async (oldState, newState) => {
    const musicService = new MusicService();

    // If the bot is in a voice channel and a user joins, start playback if there's a queue
    if (
      newState.member.user.id !== newState.client.user.id &&
      newState.channel &&
      newState.guild.members.me.voice.channel
    ) {
      try {
        // Check if the user is premium
        const isPremium = await musicService.checkPremium(newState.member.user.id);

        // If user is premium or there's a non-premium queue, start playback
        if (isPremium || musicService.hasQueue(newState.guild.id)) {
          await musicService.play(newState.guild, null, newState.channel);
        }
      } catch (error) {
        console.error('Error starting playback on voice state update:', error);
      }
    }

    // If the bot is in a voice channel and the last user leaves, leave the channel
    if (
      newState.member.user.id !== newState.client.user.id &&
      newState.guild.members.me.voice.channel &&
      newState.channel === null &&
      newState.guild.members.me.voice.channel.members.size === 1
    ) {
      try {
        await musicService.leave(newState.guild);
      } catch (error) {
        console.error('Error leaving voice channel on voice state update:', error);
      }
    }
  },
};