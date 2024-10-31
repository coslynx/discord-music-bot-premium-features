const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config/env.config');
const { getUser } = require('../services/userService');

const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await getUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};

module.exports = { authentication };