const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

module.exports = {
  info: (message) => logger.info(message),
  warn: (message) => logger.warn(message),
  error: (message, error) => logger.error(message, { stack: error.stack }),
  debug: (message) => logger.debug(message),
};