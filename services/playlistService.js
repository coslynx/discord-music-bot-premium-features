const { getPlaylistByName, createPlaylist, addToPlaylist, removeFromPlaylist, getPlaylistsByUser, updatePlaylist, deletePlaylist } = require('./databaseService');

class PlaylistService {
  async createPlaylist(userId, playlistName) {
    try {
      await createPlaylist(userId, playlistName);
    } catch (error) {
      console.error(`Error creating playlist "${playlistName}":`, error);
      throw error;
    }
  }

  async getPlaylistByName(userId, playlistName) {
    try {
      const playlist = await getPlaylistByName(userId, playlistName);
      return playlist;
    } catch (error) {
      console.error(`Error fetching playlist "${playlistName}":`, error);
      throw error;
    }
  }

  async getPlaylistsByUser(userId) {
    try {
      const playlists = await getPlaylistsByUser(userId);
      return playlists;
    } catch (error) {
      console.error(`Error fetching playlists for user ${userId}:`, error);
      throw error;
    }
  }

  async addToPlaylist(userId, playlistName, songNameOrUrl) {
    try {
      await addToPlaylist(userId, playlistName, songNameOrUrl);
    } catch (error) {
      console.error(`Error adding song to playlist "${playlistName}":`, error);
      throw error;
    }
  }

  async removeFromPlaylist(userId, playlistName, songNameOrUrl) {
    try {
      await removeFromPlaylist(userId, playlistName, songNameOrUrl);
    } catch (error) {
      console.error(`Error removing song from playlist "${playlistName}":`, error);
      throw error;
    }
  }

  async updatePlaylist(playlistId, data) {
    try {
      await updatePlaylist(playlistId, data);
    } catch (error) {
      console.error(`Error updating playlist ${playlistId}:`, error);
      throw error;
    }
  }

  async deletePlaylist(playlistId) {
    try {
      await deletePlaylist(playlistId);
    } catch (error) {
      console.error(`Error deleting playlist ${playlistId}:`, error);
      throw error;
    }
  }
}

module.exports = {
  PlaylistService,
};