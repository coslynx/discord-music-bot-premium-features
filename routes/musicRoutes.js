const express = require('express');
const router = express.Router();
const { MusicService } = require('../services/musicService');

const musicService = new MusicService();

// Get the current song playing
router.get('/current', async (req, res) => {
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

// Get the music queue
router.get('/queue', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    const queue = await musicService.getQueue(guildId);
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving music queue', error });
  }
});

// Add a song to the queue
router.post('/queue', async (req, res) => {
  const guildId = req.query.guildId;
  const songUrl = req.body.songUrl;
  try {
    await musicService.addToQueue(guildId, songUrl);
    res.status(201).json({ message: 'Song added to queue' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to queue', error });
  }
});

// Remove a song from the queue
router.delete('/queue/:position', async (req, res) => {
  const guildId = req.query.guildId;
  const position = parseInt(req.params.position, 10);
  try {
    const removedSong = await musicService.removeFromQueue(guildId, position);
    if (removedSong) {
      res.json({ message: 'Song removed from queue', song: removedSong });
    } else {
      res.status(404).json({ message: 'Song not found in queue' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error removing song from queue', error });
  }
});

// Clear the music queue
router.delete('/queue', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.clearQueue(guildId);
    res.json({ message: 'Queue cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing queue', error });
  }
});

// Shuffle the music queue
router.put('/queue/shuffle', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.shuffleQueue(guildId);
    res.json({ message: 'Queue shuffled' });
  } catch (error) {
    res.status(500).json({ message: 'Error shuffling queue', error });
  }
});

// Pause music playback
router.put('/pause', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.pause(guildId);
    res.json({ message: 'Music paused' });
  } catch (error) {
    res.status(500).json({ message: 'Error pausing music', error });
  }
});

// Resume music playback
router.put('/resume', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.resume(guildId);
    res.json({ message: 'Music resumed' });
  } catch (error) {
    res.status(500).json({ message: 'Error resuming music', error });
  }
});

// Skip the current song
router.put('/skip', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    const skippedSong = await musicService.skip(guildId);
    res.json({ message: 'Song skipped', song: skippedSong });
  } catch (error) {
    res.status(500).json({ message: 'Error skipping song', error });
  }
});

// Stop music playback
router.put('/stop', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.stop(guildId);
    res.json({ message: 'Music stopped' });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping music', error });
  }
});

// Set the music volume
router.put('/volume', async (req, res) => {
  const guildId = req.query.guildId;
  const volume = parseInt(req.body.volume, 10);
  try {
    await musicService.setVolume(guildId, volume);
    res.json({ message: 'Volume set to', volume });
  } catch (error) {
    res.status(500).json({ message: 'Error setting volume', error });
  }
});

// Seek to a specific time in the current song
router.put('/seek', async (req, res) => {
  const guildId = req.query.guildId;
  const seconds = parseInt(req.body.seconds, 10);
  try {
    await musicService.seek(guildId, seconds);
    res.json({ message: 'Seeked to', seconds });
  } catch (error) {
    res.status(500).json({ message: 'Error seeking to specific time', error });
  }
});

// Join the voice channel
router.post('/join', async (req, res) => {
  const guildId = req.query.guildId;
  const voiceChannelId = req.body.voiceChannelId;
  try {
    await musicService.join(guildId, voiceChannelId);
    res.json({ message: 'Joined voice channel' });
  } catch (error) {
    res.status(500).json({ message: 'Error joining voice channel', error });
  }
});

// Leave the voice channel
router.post('/leave', async (req, res) => {
  const guildId = req.query.guildId;
  try {
    await musicService.leave(guildId);
    res.json({ message: 'Left voice channel' });
  } catch (error) {
    res.status(500).json({ message: 'Error leaving voice channel', error });
  }
});

// Search for songs
router.get('/search', async (req, res) => {
  const query = req.query.query;
  try {
    const results = await musicService.searchSongs(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error searching for songs', error });
  }
});

// Get recommendations by genre
router.get('/recommendations/genre', async (req, res) => {
  const genre = req.query.genre;
  try {
    const recommendations = await musicService.getRecommendationsByGenre(genre);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations by genre', error });
  }
});

// Get recommendations by user
router.get('/recommendations/user', async (req, res) => {
  const userId = req.query.userId;
  try {
    const recommendations = await musicService.getRecommendationsByUser(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recommendations by user', error });
  }
});

module.exports = router;