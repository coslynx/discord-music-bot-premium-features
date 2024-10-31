const { Guild } = require('discord.js');
const { DatabaseService } = require('../services/databaseService');

module.exports = {
  name: 'guildCreate',
  once: true,
  execute: async (guild) => {
    const databaseService = new DatabaseService();
    try {
      await databaseService.createGuild(guild.id, guild.name);
    } catch (error) {
      console.error(`Error creating guild in database:`, error);
    }
  },
};