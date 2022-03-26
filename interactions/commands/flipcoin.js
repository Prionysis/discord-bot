const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("flipcoin")
        .setDescription("Flips a coin."),

    async execute (interaction) {
        await interaction.reply(`💰 ${Math.floor(Math.random() * 100) % 2 === 0 ? "Tails" : "Heads"}`)
    }
}
