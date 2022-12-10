const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flipcoin')
        .setDescription('Flips a coin.'),
    execute: async function (interaction) {
        await interaction.reply(`💰 ${Math.floor(Math.random() * 100) % 2 === 0 ? 'Tails' : 'Heads'}`);
    }
};
