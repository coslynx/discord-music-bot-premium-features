const { UserService } = require('../services/userService');
const { PremiumService } = require('../services/premiumService');

const permissions = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userService = new UserService();
    const user = await userService.getUser(userId);

    if (!user) {
      return res.status(403).json({ message: 'User not found.' });
    }

    const premiumService = new PremiumService();
    const isPremium = await premiumService.checkPremium(userId);

    if (req.path.startsWith('/premium')) {
      if (!isPremium) {
        return res.status(403).json({ message: 'Unauthorized: Premium access required.' });
      }
    }

    // Additional permission checks can be implemented here based on user roles or other criteria.
    // For example:
    // if (req.path === '/admin' && !user.isAdmin) {
    //   return res.status(403).json({ message: 'Unauthorized: Admin privileges required.' });
    // }

    next();
  } catch (error) {
    console.error('Error checking permissions:', error);
    res.status(500).json({ message: 'An error occurred while checking permissions.' });
  }
};

module.exports = { permissions };