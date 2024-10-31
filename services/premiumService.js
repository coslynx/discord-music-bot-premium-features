const { getSubscription } = require('./databaseService');

class PremiumService {
  async checkPremium(userId) {
    try {
      const subscription = await getSubscription(userId);
      if (subscription && subscription.expirationDate > new Date()) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }
}

module.exports = {
  PremiumService,
};