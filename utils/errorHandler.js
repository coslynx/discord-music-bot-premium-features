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
  handleErrors: (error, interaction) => {
    logger.error(`Error occurred: ${error.message}`);
    if (interaction) {
      interaction.reply({
        content: 'An error occurred while processing your request. Please try again later.',
        ephemeral: true,
      });
    }
  },
};