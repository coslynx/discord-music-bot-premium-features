const express = require('express');
const router = express.Router();
const { MusicService } = require('../services/musicService');
const { QueueService } = require('../services/queueService');
const { PlaylistService } = require('../services/playlistService');
const { UserService } = require('../services/userService');
const { PremiumService } = require('../services/premiumService');
const { DatabaseService } = require('../services/databaseService');

const musicService = new MusicService();
const queueService = new QueueService();
const playlistService = new PlaylistService();
const userService = new UserService();
const premiumService = new PremiumService();
const databaseService = new DatabaseService();

// Music API Routes
router.get('/music/current', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    const currentSong = musicService.getCurrentSong(guildId);
    if (currentSong) {
      res.json(currentSong);
    } else {
      res.status(404).json({ message: 'No song currently playing' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving current song', error });
  }
});

router.get('/music/queue', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    const queue = await queueService.getQueue(guildId);
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving music queue', error });
  }
});

router.post('/music/queue', async (req, res) => {
  const guildId = req.query.guildId;
  const songUrl = req.body.songUrl;
  try {
    await musicService.addToQueue(guildId, songUrl);
    res.status(201).json({ message: 'Song added to queue' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to queue', error });
  }
});

router.delete('/music/queue/:position', async (req, res) => {
  const guildId = req.query.guildId;
  const position = parseInt(req.params.position, 10);
  try {
    const removedSong = await queueService.removeFromQueue(guildId, position);
    if (removedSong) {
      res.json({ message: 'Song removed from queue', song: removedSong });
    } else {
      res.status(404).json({ message: 'Song not found in queue' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing song from queue', error });
  }
});

router.delete('/music/queue', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await queueService.clearQueue(guildId);
    res.json({ message: 'Queue cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing queue', error });
  }
});

router.put('/music/queue/shuffle', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await queueService.shuffleQueue(guildId);
    res.json({ message: 'Queue shuffled' });
  } catch (error) {
    res.status(500).json({ message: 'Error shuffling queue', error });
  }
});

router.put('/music/pause', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.pause(guildId);
    res.json({ message: 'Music paused' });
  } catch (error) {
    res.status(500).json({ message: 'Error pausing music', error });
  }
});

router.put('/music/resume', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.resume(guildId);
    res.json({ message: 'Music resumed' });
  } catch (error) {
    res.status(500).json({ message: 'Error resuming music', error });
  }
});

router.put('/music/skip', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    const skippedSong = await musicService.skip(guildId);
    res.json({ message: 'Song skipped', song: skippedSong });
  } catch (error) {
    res.status(500).json({ message: 'Error skipping song', error });
  }
});

router.put('/music/stop', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.stop(guildId);
    res.json({ message: 'Music stopped' });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping music', error });
  }
});

router.put('/music/volume', async (req, res) => {
  const guildId = req.query.guildId;
  const volume = parseInt(req.body.volume, 10);
  try {
    await musicService.setVolume(guildId, volume);
    res.json({ message: 'Volume set to', volume });
  } catch (error) {
    res.status(500).json({ message: 'Error setting volume', error });
  }
});

router.put('/music/seek', async (req, res) => {
  const guildId = req.query.guildId;
  const seconds = parseInt(req.body.seconds, 10);
  try {
    await musicService.seek(guildId, seconds);
    res.json({ message: 'Seeked to', seconds });
  } catch (error) {
    res.status(500).json({ message: 'Error seeking to specific time', error });
  }
});

router.post('/music/join', async (req, res) => {
  const guildId = req.query.guildId;
  const voiceChannelId = req.body.voiceChannelId;
  try {
    await musicService.join(guildId, voiceChannelId);
    res.json({ message: 'Joined voice channel' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining voice channel', error });
  }
});

router.post('/music/leave', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.leave(guildId);
    res.json({ message: 'Left voice channel' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving voice channel', error });
  }
});

router.get('/music/search', async (req, res) => {
  const query = req.query.query;
  try {
    const results = await musicService.searchSongs(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching for songs', error });
  }
});

router.get('/music/recommendations/genre', async (req, res) => {
  const genre = req.query.genre;
  try {
    const recommendations = await musicService.getRecommendationsByGenre(genre);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations by genre', error });
  }
});

router.get('/music/recommendations/user', async (req, res) => {
  const userId = req.query.userId;
  try {
    const recommendations = await musicService.getRecommendationsByUser(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations by user', error });
  }
});

// Playlist API Routes
router.post('/playlists', async (req, res) => {
  const userId = req.query.userId;
  const playlistName = req.body.playlistName;
  try {
    await playlistService.createPlaylist(userId, playlistName);
    res.status(201).json({ message: 'Playlist created' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating playlist', error });
  }
});

router.get('/playlists/:playlistName', async (req, res) => {
  const userId = req.query.userId;
  const playlistName = req.params.playlistName;
  try {
    const playlist = await playlistService.getPlaylistByName(userId, playlistName);
    if (playlist) {
      res.json(playlist);
    } else {
      res.status(404).json({ message: 'Playlist not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving playlist', error });
  }
});

router.get('/playlists', async (req, res) => {
  const userId = req.query.userId;
  try {
    const playlists = await playlistService.getPlaylistsByUser(userId);
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving playlists', error });
  }
});

router.post('/playlists/:playlistName/songs', async (req, res) => {
  const userId = req.query.userId;
  const playlistName = req.params.playlistName;
  const songUrl = req.body.songUrl;
  try {
    await playlistService.addToPlaylist(userId, playlistName, songUrl);
    res.status(201).json({ message: 'Song added to playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to playlist', error });
  }
});

router.delete('/playlists/:playlistName/songs/:songUrl', async (req, res) => {
  const userId = req.query.userId;
  const playlistName = req.params.playlistName;
  const songUrl = req.params.songUrl;
  try {
    await playlistService.removeFromPlaylist(userId, playlistName, songUrl);
    res.json({ message: 'Song removed from playlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing song from playlist', error });
  }
});

router.put('/playlists/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId;
  const data = req.body;
  try {
    await playlistService.updatePlaylist(playlistId, data);
    res.json({ message: 'Playlist updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating playlist', error });
  }
});

router.delete('/playlists/:playlistId', async (req, res) => {
  const playlistId = req.params.playlistId;
  try {
    await playlistService.deletePlaylist(playlistId);
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting playlist', error });
  }
});

// User API Routes
router.get('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userService.getUser(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user', error });
  }
});

router.put('/users/:userId', async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;
  try {
    await userService.updateUser(userId, data);
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Premium API Routes
router.get('/premium/check', async (req, res) => {
  const userId = req.query.userId;
  try {
    const isPremium = await premiumService.checkPremium(userId);
    res.json({ isPremium });
  } catch (error) {
    res.status(500).json({ message: 'Error checking premium status', error });
  }
});

// Database API Routes
router.get('/database/songPlayCount', async (req, res) => {
  try {
    const songPlayCount = await databaseService.getSongPlayCount();
    res.json({ songPlayCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching song play count', error });
  }
});

router.post('/database/subscriptions', async (req, res) => {
  const userId = req.body.userId;
  const plan = req.body.plan;
  const subscriptionDate = req.body.subscriptionDate;
  const expirationDate = req.body.expirationDate;
  try {
    await databaseService.createSubscription(userId, plan, subscriptionDate, expirationDate);
    res.status(201).json({ message: 'Subscription created' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription', error });
  }
});

router.get('/database/subscriptions/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const subscription = await databaseService.getSubscription(userId);
    if (subscription) {
      res.json(subscription);
    } else {
      res.status(404).json({ message: 'Subscription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving subscription', error });
  }
});

router.put('/database/subscriptions/:userId', async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;
  try {
    await databaseService.updateSubscription(userId, data);
    res.json({ message: 'Subscription updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subscription', error });
  }
});

router.delete('/database/subscriptions/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    await databaseService.deleteSubscription(userId);
    res.json({ message: 'Subscription deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subscription', error });
  }
});

// ... other API routes 

module.exports = router;