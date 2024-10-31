const { Interaction } = require('discord.js');
const { commands } = require('../utils/commandHandler');

module.exports = {
  name: 'interactionCreate',
  once: false,
  execute: async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commands.find(
        (cmd) => cmd.data.name === interaction.commandName,
      );

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  },
};