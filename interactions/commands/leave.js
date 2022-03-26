const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("leave")
		.setDescription("The bot drops the mic and yeets out."),

	async execute (interaction) {
		const queue = interaction.client.queue.get(interaction.guildId)

		if (!interaction.member.voice.channel)
			return await interaction.reply({
				content: "You're not in a voice channel.",
				ephemeral: true
			})

		if (interaction.member.voice.channel !== queue.channelVoice)
			return await interaction.reply({
				content: "You're not in the same voice channel as me.",
				ephemeral: true
			})

		if (queue.connection) queue.connection.destroy()
	}
}
