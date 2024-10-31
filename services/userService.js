const { getUser, updateUser } = require('./databaseService');

class UserService {
  async getUser(userId) {
    try {
      const user = await getUser(userId);
      return user;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  }

  async updateUser(userId, data) {
    try {
      await updateUser(userId, data);
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = {
  UserService,
};