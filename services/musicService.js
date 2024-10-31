const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require('@discordjs/voice');
const { PlayerManager } = require('lavalink');
const {
  getQueue,
  addToQueue,
  removeFromQueue,
  clearQueue,
  shuffleQueue,
  getQueueSize,
  findSong,
  createSong,
} = require('./databaseService');
const { getSubscription } = require('./databaseService');
const logger = require('../utils/logger');

class MusicService {
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
              logger.info('Successfully rejoined voice channel in ${guild.name}.');
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

  async play(guild, songUrl, textChannel) {
    try {
      const player = this.players.get(guild.id).player;
      const connection = this.players.get(guild.id).connection;

      if (!connection) {
        throw new Error('Not connected to a voice channel.');
      }

      if (songUrl) {
        const resource = await this.playerManager.decode(songUrl);
        const audioResource = createAudioResource(resource.track);

        this.players.get(guild.id).currentSong = {
          title: resource.info.title,
          artist: resource.info.author,
          duration: resource.info.length,
          url: songUrl,
        };

        player.play(audioResource);
        logger.info(`Playing ${resource.info.title} in ${guild.name}.`);
      } else if (this.hasQueue(guild.id)) {
        const nextSong = await this.getNextSong(guild);

        if (nextSong) {
          const resource = await this.playerManager.decode(nextSong.url);
          const audioResource = createAudioResource(resource.track);

          this.players.get(guild.id).currentSong = {
            title: resource.info.title,
            artist: resource.info.author,
            duration: resource.info.length,
            url: nextSong.url,
          };

          player.play(audioResource);
          logger.info(`Playing ${resource.info.title} in ${guild.name}.`);
        } else {
          logger.warn(`No songs in queue for guild ${guild.id}.`);
          this.leave(guild);
        }
      } else {
        logger.warn(`No songs in queue for guild ${guild.id}.`);
        this.leave(guild);
      }
    } catch (error) {
      logger.error(`Error playing music:`, error);
      throw error;
    }
  }

  async pause(guild) {
    try {
      const player = this.players.get(guild.id).player;
      if (!player) {
        throw new Error('Not connected to a voice channel.');
      }
      player.pause();
      logger.info(`Paused music in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error pausing music:`, error);
      throw error;
    }
  }

  async resume(guild) {
    try {
      const player = this.players.get(guild.id).player;
      if (!player) {
        throw new Error('Not connected to a voice channel.');
      }
      player.unpause();
      logger.info(`Resumed music in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error resuming music:`, error);
      throw error;
    }
  }

  async skip(guild) {
    try {
      const player = this.players.get(guild.id).player;
      if (!player) {
        throw new Error('Not connected to a voice channel.');
      }
      player.stop();
      const skippedSong = this.players.get(guild.id).currentSong;
      logger.info(`Skipped song ${skippedSong.title} in ${guild.name}.`);
      return skippedSong;
    } catch (error) {
      logger.error(`Error skipping song:`, error);
      throw error;
    }
  }

  async stop(guild) {
    try {
      const player = this.players.get(guild.id).player;
      if (!player) {
        throw new Error('Not connected to a voice channel.');
      }
      player.stop();
      logger.info(`Stopped music in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error stopping music:`, error);
      throw error;
    }
  }

  async setVolume(guild, volume) {
    try {
      const player = this.players.get(guild.id).player;
      if (!player) {
        throw new Error('Not connected to a voice channel.');
      }
      player.volume = volume / 100;
      logger.info(`Set volume to ${volume} in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error setting volume:`, error);
      throw error;
    }
  }

  async seek(guild, seconds) {
    try {
      const player = this.players.get(guild.id).player;
      if (!player) {
        throw new Error('Not connected to a voice channel.');
      }
      player.seek(seconds  1000);
      logger.info(`Seeked to ${seconds} seconds in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error seeking to specific time:`, error);
      throw error;
    }
  }

  getCurrentSong(guild) {
    try {
      return this.players.get(guild.id).currentSong;
    } catch (error) {
      logger.error(`Error getting current song:`, error);
      throw error;
    }
  }

  formatDuration(duration) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  hasQueue(guildId) {
    return this.queues.has(guildId) && this.queues.get(guildId).length > 0;
  }

  async getNextSong(guild) {
    try {
      const queue = await getQueue(guild.id);
      if (queue && queue.length > 0) {
        return queue.shift();
      }
      return null;
    } catch (error) {
      logger.error(`Error getting next song from queue:`, error);
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

  async findSong(songNameOrUrl) {
    try {
      let song = await findSong(songNameOrUrl);
      if (song) {
        return song;
      }

      const searchResults = await this.playerManager.search(songNameOrUrl);
      if (searchResults.loadType === 'TRACK_LOADED') {
        song = await createSong({
          title: searchResults.tracks[0].info.title,
          artist: searchResults.tracks[0].info.author,
          url: searchResults.tracks[0].info.uri,
          duration: searchResults.tracks[0].info.length,
        });
      } else {
        throw new Error('No song found.');
      }
      return song;
    } catch (error) {
      logger.error(`Error finding song:`, error);
      throw error;
    }
  }

  async searchSongs(query) {
    try {
      const searchResults = await this.playerManager.search(query);
      if (searchResults.loadType === 'SEARCH_RESULT') {
        const results = searchResults.tracks.slice(0, 5).map((song) => ({
          title: song.info.title,
          artist: song.info.author,
          url: song.info.uri,
        }));
        return results;
      }
      return [];
    } catch (error) {
      logger.error(`Error searching for songs:`, error);
      throw error;
    }
  }

  async getRecommendationsByGenre(genre) {
    try {
      // Implement logic to fetch recommendations based on genre
      // Use a music API or your own recommendation algorithm
      return [];
    } catch (error) {
      logger.error(`Error getting recommendations by genre:`, error);
      throw error;
    }
  }

  async getRecommendationsByUser(user) {
    try {
      // Implement logic to fetch recommendations based on user data
      // Use a music API or your own recommendation algorithm
      return [];
    } catch (error) {
      logger.error(`Error getting recommendations by user:`, error);
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

  async setLoopMode(guild, loopMode) {
    try {
      this.players.get(guild.id).loopMode = loopMode;
      logger.info(`Set loop mode to ${loopMode} in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error setting loop mode:`, error);
      throw error;
    }
  }

  async setRepeat(guild, repeatTimes) {
    try {
      this.players.get(guild.id).repeatTimes = repeatTimes;
      logger.info(`Set repeat to ${repeatTimes} in ${guild.name}.`);
    } catch (error) {
      logger.error(`Error setting repeat:`, error);
      throw error;
    }
  }

  async updateSongPlayCount(song) {
    try {
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
}

module.exports = { MusicService };