const { AudioPlayerStatus } = require("@discordjs/voice")

module.exports = {
	name: "play", async execute (interaction) {
		const queue = interaction.client.queue.get(interaction.guild.id)

		if (!queue) return interaction.deferUpdate()
		if (!interaction.member.voice.channel) return interaction.deferUpdate()
		if (interaction.member.voice.channel !== queue.channelVoice) return interaction.deferUpdate()

		const status = queue.player.state.status
		const messageActionRow = interaction.message.components[0]
		const buttonPlay = messageActionRow.components[0]

		if (status === AudioPlayerStatus.Playing) {
			buttonPlay.setStyle("SUCCESS").setLabel("Resume")
			queue.player.pause()
		} else {
			buttonPlay.setStyle("DANGER").setLabel("Pause")
			queue.player.unpause()
		}

		await interaction.deferUpdate()
		interaction.message.edit({ components: [messageActionRow] })
	}
}
