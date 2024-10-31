const { getSubscription } = require('./databaseService');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { PlayerManager } = require('lavalink');
const { createSong, findSong } = require('./databaseService');
const logger = require('../utils/logger');

class VoiceCommandHandler {
  constructor() {
    this.playerManager = new PlayerManager({
      nodes: [
        {
          id: 'main',
          host: process.env.LAVALINK_HOST,
          port: process.env.LAVALINK_PORT || 2333,
          password: process.env.LAVALINK_PASSWORD,
          secure: false,
        },
      ],
    });

    this.players = new Map();
    this.queues = new Map();
  }

  async handleVoiceCommand(interaction, command, args) {
    try {
      switch (command) {
        case 'play':
          await this.play(interaction, args);
          break;
        case 'pause':
          await this.pause(interaction);
          break;
        case 'resume':
          await this.resume(interaction);
          break;
        case 'skip':
          await this.skip(interaction);
          break;
        case 'stop':
          await this.stop(interaction);
          break;
        case 'volume':
          await this.setVolume(interaction, args);
          break;
        case 'seek':
          await this.seek(interaction, args);
          break;
        default:
          interaction.reply({
            content: 'Invalid voice command.',
            ephemeral: true,
          });
      }
    } catch (error) {
      logger.error('Error handling voice command:', error);
      interaction.reply({
        content: 'An error occurred while processing your voice command.',
        ephemeral: true,
      });
    }
  }

  async play(interaction, songNameOrUrl) {
    try {
      const guild = interaction.guild;
      const voiceChannel = interaction.member.voice.channel;

      if (!voiceChannel) {
        return interaction.reply({
          content: 'You must be in a voice channel to use this command.',
          ephemeral: true,
        });
      }

      let song = await findSong(songNameOrUrl);
      if (!song) {
        const searchResults = await this.playerManager.search(songNameOrUrl);
        if (searchResults.loadType === 'TRACK_LOADED') {
          song = await createSong({
            title: searchResults.tracks[0].info.title,
            artist: searchResults.tracks[0].info.author,
            url: searchResults.tracks[0].info.uri,
            duration: searchResults.tracks[0].info.length,
          });
        } else {
          return interaction.reply({
            content: 'No song found matching your request.',
            ephemeral: true,
          });
        }
      }

      if (!guild.members.me.voice.channel) {
        await this.join(guild, voiceChannel);
      }

      const player = this.players.get(guild.id).player;
      const connection = this.players.get(guild.id).connection;

      if (!connection) {
        return interaction.reply({
          content: 'I am not connected to a voice channel.',
          ephemeral: true,
        });
      }

      const resource = await this.playerManager.decode(song.url);
      const audioResource = createAudioResource(resource.track);

      this.players.get(guild.id).currentSong = {
        title: resource.info.title,
        artist: resource.info.author,
        duration: resource.info.length,
        url: song.url,
      };

      player.play(audioResource);
      interaction.reply({
        content: `Now playing ${song.title}.`,
        ephemeral: true,
      });
    } catch (error) {
      logger.error('Error playing song:', error);
      interaction.reply({
        content: 'An error occurred while playing the song.',
        ephemeral: true,
      });
    }
  }

  async pause(interaction) {
    try {
      const guild = interaction.guild;

      if (!guild.members.me.voice.channel) {
        return interaction.reply({
          content: 'I am not in a voice channel.',
          ephemeral: true,
        });
      }

      const player = this.players.get(guild.id).player;
      if (!player) {
        return interaction.reply({
          content: 'There is no song currently playing.',
          ephemeral: true,
        });
      }

      player.pause();
      interaction.reply({
        content: 'Music paused.',
        ephemeral: true,
      });
    } catch (error) {
      logger.error('Error pausing music:', error);
      interaction.reply({
        content: 'An error occurred while pausing the music.',
        ephemeral: true,
      });
    }
  }

  async resume(interaction) {
    try {
      const guild = interaction.guild;

      if (!guild.members.me.voice.channel) {
        return interaction.reply({
          content: 'I am not in a voice channel.',
          ephemeral: true,
        });
      }

      const player = this.players.get(guild.id).player;
      if (!player) {
        return interaction.reply({
          content: 'There is no song currently playing.',
          ephemeral: true,
        });
      }

      player.unpause();
      interaction.reply({
        content: 'Resuming the music.',
        ephemeral: true,
      });
    } catch (error) {
      logger.error('Error resuming music:', error);
      interaction.reply({
        content: 'An error occurred while resuming the music.',
        ephemeral: true,
      });
    }
  }

  async skip(interaction) {
    try {
      const guild = interaction.guild;

      if (!guild.members.me.voice.channel) {
        return interaction.reply({
          content: 'I am not in a voice channel.',
          ephemeral: true,
        });
      }

      const player = this.players.get(guild.id).player;
      if (!player) {
        return interaction.reply({
          content: 'There is no song currently playing.',
          ephemeral: true,
        });
      }

      player.stop();
      const skippedSong = this.players.get(guild.id).currentSong;
      interaction.reply({
        content: `Skipped ${skippedSong.title}.`,
        ephemeral: true,
      });
    } catch (error) {
      logger.error('Error skipping song:', error);
      interaction.reply({
        content: 'An error occurred while skipping the song.',
        ephemeral: true,
      });
    }
  }

  async stop(interaction) {
    try {
      const guild = interaction.guild;

      if (!guild.members.me.voice.channel) {
        return interaction.reply({
          content: 'I am not in a voice channel.',
          ephemeral: true,
        });
      }

      const player = this.players.get(guild.id).player;
      if (!player) {
        return interaction.reply({
          content: 'There is no song currently playing.',
          ephemeral: true,
        });
      }

      player.stop();
      interaction.reply({
        content: 'Stopped the music.',
        ephemeral: true,
      });
      this.leave(guild);
    } catch (error) {
      logger.error('Error stopping music:', error);
      interaction.reply({
        content: 'An error occurred while stopping the music.',
        ephemeral: true,
      });
    }
  }

  async setVolume(interaction, volume) {
    try {
      const guild = interaction.guild;

      if (!guild.members.me.voice.channel) {
        return interaction.reply({
          content: 'I am not in a voice channel.',
          ephemeral: true,
        });
      }

      const player = this.players.get(guild.id).player;
      if (!player) {
        return interaction.reply({
          content: 'There is no song currently playing.',
          ephemeral: true,
        });
      }

      if (volume < 0 || volume > 200) {
        return interaction.reply({
          content: 'Volume must be between 0 and 200.',
          ephemeral: true,
        });
      }

      player.volume = volume / 100;
      interaction.reply({
        content: `Volume set to ${volume}.`,
        ephemeral: true,
      });
    } catch (error) {
      logger.error('Error setting volume:', error);
      interaction.reply({
        content: 'An error occurred while setting the volume.',
        ephemeral: true,
      });
    }
  }

  async seek(interaction, seconds) {
    try {
      const guild = interaction.guild;

      if (!guild.members.me.voice.channel) {
        return interaction.reply({
          content: 'I am not in a voice channel.',
          ephemeral: true,
        });
      }

      const player = this.players.get(guild.id).player;
      if (!player) {
        return interaction.reply({
          content: 'There is no song currently playing.',
          ephemeral: true,
        });
      }

      if (seconds < 0) {
        return interaction.reply({
          content: 'Seconds cannot be negative.',
          ephemeral: true,
        });
      }

      player.seek(seconds  1000);
      interaction.reply({
        content: `Seeked to ${seconds} seconds.`,
        ephemeral: true,
      });
    } catch (error) {
      logger.error('Error seeking to specific time:', error);
      interaction.reply({
        content: 'An error occurred while seeking to the specified time.',
        ephemeral: true,
      });
    }
  }

  async join(guild, voiceChannel) {
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });

      this.players.set(guild.id, {
        player: createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
          },
        }),
        connection,
        currentSong: null,
        loopMode: 'off',
        repeatTimes: 1,
      });

      const player = this.players.get(guild.id).player;

      // Handle player events
      player.on(AudioPlayerStatus.Playing, () => {
        // Log that playback has started
        logger.info(`Playback started in ${guild.name} for ${this.players.get(guild.id).currentSong.title}.`);
        // Update database with song play count
        this.updateSongPlayCount(this.players.get(guild.id).currentSong);
      });

      player.on(AudioPlayerStatus.Paused, () => {
        // Log that playback has paused
        logger.info(`Playback paused in ${guild.name}.`);
      });

      player.on(AudioPlayerStatus.AutoPaused, () => {
        // Log that playback has auto-paused
        logger.info(`Playback auto-paused in ${guild.name}.`);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        // Log that playback is idle
        logger.info(`Playback idle in ${guild.name}.`);
        this.playNext(guild);
      });

      player.on('error', (error) => {
        // Log any player errors
        logger.error(`Player error in ${guild.name}:`, error);
        this.playNext(guild);
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        // Log that the connection was disconnected
        logger.warn(`Disconnected from voice channel in ${guild.name}.`);
        try {
          // Try to reconnect after 5 seconds
          setTimeout(() => {
            if (this.hasQueue(guild.id) && this.players.get(guild.id).connection.rejoin()) {
              logger.info(`Successfully rejoined voice channel in ${guild.name}.`);
            }
          }, 5000);
        } catch (error) {
          // Log any errors that occur during the reconnect process
          logger.error(`Error reconnecting to voice channel in ${guild.name}:`, error);
          // Clean up the player and connection
          this.leave(guild);
        }
      });

      connection.on(VoiceConnectionStatus.Connecting, () => {
        // Log that the connection is connecting
        logger.info(`Connecting to voice channel in ${guild.name}.`);
      });

      connection.on(VoiceConnectionStatus.Ready, () => {
        // Log that the connection is ready
        logger.info(`Voice connection ready in ${guild.name}.`);
      });

      // Handle the "raw" events from the client to update Lavalink
      connection.client.on('raw', (packet) => {
        if (packet.t === 'VOICE_SERVER_UPDATE') {
          this.playerManager.voiceServerUpdate(packet);
        } else if (packet.t === 'VOICE_STATE_UPDATE') {
          this.playerManager.voiceStateUpdate(packet);
        }
      });

      logger.info(`Joined voice channel ${voiceChannel.name} in ${guild.name}.`);
      return connection;
    } catch (error) {
      logger.error(`Error joining voice channel:`, error);
      throw error;
    }
  }

  async playNext(guild) {
    try {
      if (this.players.get(guild.id).loopMode === 'song') {
        const currentSong = this.players.get(guild.id).currentSong;
        await this.play(guild, currentSong.url);
      } else if (this.players.get(guild.id).loopMode === 'queue') {
        this.play(guild);
      } else if (this.players.get(guild.id).repeatTimes > 1) {
        this.players.get(guild.id).repeatTimes -= 1;
        await this.play(guild, this.players.get(guild.id).currentSong.url);
      } else {
        this.play(guild);
      }
    } catch (error) {
      logger.error(`Error playing next song:`, error);
      throw error;
    }
  }

  async leave(guild) {
    try {
      if (this.players.has(guild.id)) {
        const player = this.players.get(guild.id).player;
        const connection = this.players.get(guild.id).connection;
        if (player) {
          player.stop();
          this.players.delete(guild.id);
        }
        if (connection) {
          connection.disconnect();
          this.players.delete(guild.id);
        }
        logger.info(`Left voice channel in ${guild.name}.`);
      }
    } catch (error) {
      logger.error(`Error leaving voice channel:`, error);
      throw error;
    }
  }

  async updateSongPlayCount(song) {
    try {
      // Update the play count in the database
      // Assuming you have a database service to interact with
      await this.connection.manager.update(
        Song,
        { songId: song.songId },
        { playCount: song.playCount + 1 },
      );
      logger.info(`Updated play count for song ${song.title}.`);
    } catch (error) {
      logger.error(`Error updating play count for song:`, error);
      throw error;
    }
  }

  async checkPremium(userId) {
    try {
      const subscription = await getSubscription(userId);
      if (subscription && subscription.expirationDate > new Date()) {
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error checking premium status for user:`, error);
      throw error;
    }
  }

  hasQueue(guildId) {
    return this.queues.has(guildId) && this.queues.get(guildId).length > 0;
  }

  async getNextSong(guild) {
    try {
      const queue = await this.queues.get(guild.id);
      if (queue && queue.length > 0) {
        return queue.shift();
      }
      return null;
    } catch (error) {
      logger.error(`Error getting next song from queue:`, error);
      throw error;
    }
  }
}

module.exports = { VoiceCommandHandler };