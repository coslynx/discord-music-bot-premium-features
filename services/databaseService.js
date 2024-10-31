const { createConnection, Entity, Column, PrimaryGeneratedColumn } = require("typeorm");
const { User } = require("../models/user");
const { Playlist } = require("../models/playlist");
const { Song } = require("../models/song");
const { Subscription } = require("../models/subscription");
const logger = require("../utils/logger");

class DatabaseService {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await createConnection({
        type: "postgres",
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [User, Playlist, Song, Subscription],
        synchronize: true,
        logging: false,
      });

      logger.info("Connected to the database successfully.");
    } catch (error) {
      logger.error("Error connecting to the database:", error);
      throw error;
    }
  }

  async createUser(userId, username) {
    try {
      const user = new User();
      user.userId = userId;
      user.username = username;

      await this.connection.manager.save(user);
    } catch (error) {
      logger.error(`Error creating user with ID ${userId}:`, error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const user = await this.connection.manager.findOne(User, {
        where: { userId },
      });

      return user;
    } catch (error) {
      logger.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  }

  async updateUser(userId, data) {
    try {
      await this.connection.manager.update(
        User,
        { userId },
        { ...data }
      );
    } catch (error) {
      logger.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      await this.connection.manager.delete(User, { userId });
    } catch (error) {
      logger.error(`Error deleting user with ID ${userId}:`, error);
      throw error;
    }
  }

  async createPlaylist(userId, playlistName) {
    try {
      const playlist = new Playlist();
      playlist.userId = userId;
      playlist.name = playlistName;
      playlist.songs = [];

      await this.connection.manager.save(playlist);
    } catch (error) {
      logger.error(`Error creating playlist ${playlistName}:`, error);
      throw error;
    }
  }

  async getPlaylistByName(userId, playlistName) {
    try {
      const playlist = await this.connection.manager.findOne(Playlist, {
        where: { userId, name: playlistName },
      });

      return playlist;
    } catch (error) {
      logger.error(
        `Error fetching playlist ${playlistName} for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  async getPlaylistsByUser(userId) {
    try {
      const playlists = await this.connection.manager.find(Playlist, {
        where: { userId },
      });

      return playlists;
    } catch (error) {
      logger.error(`Error fetching playlists for user ${userId}:`, error);
      throw error;
    }
  }

  async updatePlaylist(playlistId, data) {
    try {
      await this.connection.manager.update(
        Playlist,
        { playlistId },
        { ...data }
      );
    } catch (error) {
      logger.error(`Error updating playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async deletePlaylist(playlistId) {
    try {
      await this.connection.manager.delete(Playlist, { playlistId });
    } catch (error) {
      logger.error(`Error deleting playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async addToPlaylist(userId, playlistName, songNameOrUrl) {
    try {
      const playlist = await this.getPlaylistByName(userId, playlistName);

      if (!playlist) {
        throw new Error(`Playlist ${playlistName} not found`);
      }

      const song = await this.findSong(songNameOrUrl);

      if (!song) {
        throw new Error(`Song ${songNameOrUrl} not found`);
      }

      playlist.songs.push(song);
      await this.connection.manager.save(playlist);
    } catch (error) {
      logger.error(
        `Error adding song ${songNameOrUrl} to playlist ${playlistName}:`,
        error
      );
      throw error;
    }
  }

  async removeFromPlaylist(userId, playlistName, songNameOrUrl) {
    try {
      const playlist = await this.getPlaylistByName(userId, playlistName);

      if (!playlist) {
        throw new Error(`Playlist ${playlistName} not found`);
      }

      const songIndex = playlist.songs.findIndex(
        (song) => song.title === songNameOrUrl
      );

      if (songIndex === -1) {
        throw new Error(`Song ${songNameOrUrl} not found in playlist`);
      }

      playlist.songs.splice(songIndex, 1);
      await this.connection.manager.save(playlist);
    } catch (error) {
      logger.error(
        `Error removing song ${songNameOrUrl} from playlist ${playlistName}:`,
        error
      );
      throw error;
    }
  }

  async createSong(songData) {
    try {
      const song = new Song();
      song.title = songData.title;
      song.artist = songData.artist;
      song.url = songData.url;
      song.duration = songData.duration;

      await this.connection.manager.save(song);

      return song;
    } catch (error) {
      logger.error("Error creating song:", error);
      throw error;
    }
  }

  async findSong(songNameOrUrl) {
    try {
      const song = await this.connection.manager.findOne(Song, {
        where: [
          { title: songNameOrUrl },
          { url: songNameOrUrl },
        ],
      });

      return song;
    } catch (error) {
      logger.error(
        `Error finding song with title or URL ${songNameOrUrl}:`,
        error
      );
      throw error;
    }
  }

  async getSongPlayCount() {
    try {
      const songPlayCount = await this.connection.manager.count(Song);
      return songPlayCount;
    } catch (error) {
      logger.error("Error fetching song play count:", error);
      throw error;
    }
  }

  async createSubscription(userId, plan, subscriptionDate, expirationDate) {
    try {
      const subscription = new Subscription();
      subscription.userId = userId;
      subscription.plan = plan;
      subscription.subscriptionDate = subscriptionDate;
      subscription.expirationDate = expirationDate;

      await this.connection.manager.save(subscription);
    } catch (error) {
      logger.error("Error creating subscription:", error);
      throw error;
    }
  }

  async getSubscription(userId) {
    try {
      const subscription = await this.connection.manager.findOne(Subscription, {
        where: { userId },
      });

      return subscription;
    } catch (error) {
      logger.error(`Error fetching subscription for user ${userId}:`, error);
      throw error;
    }
  }

  async updateSubscription(userId, data) {
    try {
      await this.connection.manager.update(
        Subscription,
        { userId },
        { ...data }
      );
    } catch (error) {
      logger.error(`Error updating subscription for user ${userId}:`, error);
      throw error;
    }
  }

  async deleteSubscription(userId) {
    try {
      await this.connection.manager.delete(Subscription, { userId });
    } catch (error) {
      logger.error(`Error deleting subscription for user ${userId}:`, error);
      throw error;
    }
  }

  async createGuild(guildId, guildName) {
    try {
      // Implement guild creation logic here, if needed.
      // Example: storing guild information for later use
    } catch (error) {
      logger.error(`Error creating guild ${guildId}:`, error);
      throw error;
    }
  }

  async getGuild(guildId) {
    try {
      // Implement guild retrieval logic here, if needed.
      // Example: retrieving guild information based on guild ID
    } catch (error) {
      logger.error(`Error fetching guild ${guildId}:`, error);
      throw error;
    }
  }

  async updateGuild(guildId, data) {
    try {
      // Implement guild update logic here, if needed.
      // Example: updating guild settings based on guild ID
    } catch (error) {
      logger.error(`Error updating guild ${guildId}:`, error);
      throw error;
    }
  }

  async deleteGuild(guildId) {
    try {
      // Implement guild deletion logic here, if needed.
      // Example: deleting guild information from the database
    } catch (error) {
      logger.error(`Error deleting guild ${guildId}:`, error);
      throw error;
    }
  }
}

module.exports = {
  DatabaseService,
};