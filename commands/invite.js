const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get an invite link to add the bot to another server.'),
  execute(interaction) {
    interaction.reply({
      content: `You can add me to your server using this invite link: ${interaction.client.generateInvite({
        scopes: ['bot', 'applications.commands'],
      })}`,
      ephemeral: true,
    });
  },
};