const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Rolls a dice.'),

    execute: async function (interaction) {
        await interaction.reply(`:game_die: ${Math.floor(Math.random() * 6) + 1}`);
    }
};
