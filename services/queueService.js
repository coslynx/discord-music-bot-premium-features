const { getQueue, addToQueue, removeFromQueue, clearQueue, shuffleQueue, getQueueSize } = require('./databaseService');

class QueueService {
  async getQueue(guildId) {
    try {
      const queue = await getQueue(guildId);
      return queue;
    } catch (error) {
      console.error(`Error fetching queue for guild ${guildId}:`, error);
      throw error;
    }
  }

  async addToQueue(guildId, song) {
    try {
      await addToQueue(guildId, song);
    } catch (error) {
      console.error(`Error adding song to queue for guild ${guildId}:`, error);
      throw error;
    }
  }

  async removeFromQueue(guildId, position) {
    try {
      const removedSong = await removeFromQueue(guildId, position);
      return removedSong;
    } catch (error) {
      console.error(`Error removing song from queue for guild ${guildId}:`, error);
      throw error;
    }
  }

  async clearQueue(guildId) {
    try {
      await clearQueue(guildId);
    } catch (error) {
      console.error(`Error clearing queue for guild ${guildId}:`, error);
      throw error;
    }
  }

  async shuffleQueue(guildId) {
    try {
      await shuffleQueue(guildId);
    } catch (error) {
      console.error(`Error shuffling queue for guild ${guildId}:`, error);
      throw error;
    }
  }

  getQueueSize(guildId) {
    try {
      const queueSize = getQueueSize(guildId);
      return queueSize;
    } catch (error) {
      console.error(`Error getting queue size for guild ${guildId}:`, error);
      throw error;
    }
  }
}

module.exports = {
  QueueService,
};