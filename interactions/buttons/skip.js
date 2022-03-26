module.exports = {
	name: "skip", async execute (interaction) {
		const queue = interaction.client.queue.get(interaction.guild.id)

		if (!queue) return interaction.deferUpdate()
		if (!interaction.member.voice.channel) return interaction.deferUpdate()
		if (interaction.member.voice.channel !== queue.channelVoice) return interaction.deferUpdate()

		queue.player.stop()
		await interaction.deferUpdate()
	}
}
