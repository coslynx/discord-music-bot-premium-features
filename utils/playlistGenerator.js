const { getPlaylistsByUser, getPlaylistByName, addToPlaylist } = require('./databaseService');
const { getUser } = require('./databaseService');
const { findSong } = require('./databaseService');
const logger = require('../utils/logger');
const { MusicService } = require('../services/musicService');

const generatePlaylist = async (userId, playlistName, options) => {
  try {
    const user = await getUser(userId);

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    let playlist = await getPlaylistByName(userId, playlistName);

    if (!playlist) {
      playlist = await getPlaylistsByUser(userId).then((playlists) => {
        if (playlists.length > 0) {
          return playlists.find((p) => p.name === playlistName);
        }
        return null;
      });
    }

    if (!playlist) {
      playlist = await createPlaylist(userId, playlistName);
    }

    // TODO: Implement playlist generation logic based on options
    // Use MusicService.getRecommendationsByGenre, MusicService.getRecommendationsByUser, or other logic
    // to fetch recommended songs. 
    // Example:
    // const recommendedSongs = await MusicService.getRecommendationsByGenre(options.genre);
    // Or
    // const recommendedSongs = await MusicService.getRecommendationsByUser(user);

    const recommendedSongs = [];

    for (const song of recommendedSongs) {
      try {
        const existingSong = await findSong(song.url);

        if (!existingSong) {
          // Create the song in the database if it doesn't exist
          const newSong = await MusicService.createSong(song);
          await addToPlaylist(playlist.playlistId, newSong);
        } else {
          // Add existing song to the playlist
          await addToPlaylist(playlist.playlistId, existingSong);
        }
      } catch (error) {
        logger.error(`Error adding song to playlist: ${error.message}`);
      }
    }

    return playlist;
  } catch (error) {
    logger.error(`Error generating playlist: ${error.message}`);
    throw error;
  }
};

module.exports = { generatePlaylist };