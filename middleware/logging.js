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

const logRequest = (req, res, next) => {
  logger.info(`Request received: ${req.method} ${req.originalUrl}`);
  next();
};

const logResponse = (req, res, next) => {
  res.on('finish', () => {
    logger.info(`Response sent: ${res.statusCode} ${req.originalUrl}`);
  });
  next();
};

module.exports = {
  logRequest,
  logResponse,
};