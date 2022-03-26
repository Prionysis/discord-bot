const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dice")
        .setDescription("Rolls a dice."),

    async execute (interaction) {
        await interaction.reply(`:game_die: ${Math.floor(Math.random() * 6) + 1}`)
    }
}
