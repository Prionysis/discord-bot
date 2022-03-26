const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js")
const {
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	NoSubscriberBehavior,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	entersState
} = require("@discordjs/voice")
const youtube = require("play-dl")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Streams audio from the specified YouTube URL.")

		.addStringOption(option =>
			option
				.setName("query")
				.setDescription("YouTube URL or search function.")
				.setRequired(true)
		),

	async execute (interaction) {
		if (!interaction.member.voice.channel)
			return await interaction.reply({
				content: "You're not in a voice channel.",
				ephemeral: true
			})

		await interaction.deferReply()

		const query = interaction.options.getString("query")
		const results = await youtube.search(query, { limit: 1 })
		const result = results[0]

		let audio = await youtube.stream(result.url)
		let queue = interaction.client.queue.get(interaction.guild.id)

		if (!queue) {
			interaction.client.queue.set(
				interaction.guildId,
				queue = {
					connection: joinVoiceChannel({
						channelId: interaction.member.voice.channelId,
						guildId: interaction.guildId,
						adapterCreator:
						interaction.member.voice.guild.voiceAdapterCreator
					}),
					player: createAudioPlayer({
						behaviors: {
							noSubscriber: NoSubscriberBehavior.Play
						}
					}),
					channelText: interaction.channel,
					channelVoice: interaction.member.voice.channel,
					songs: [],
					message: null
				}
			)

			await interaction.editReply(`🎶 I've joined ${queue.channelVoice}`)
		}

		queue.songs.push({
			url: result.url,
			title: result.title,
			duration: result.durationRaw,
			uploadedAt: result.uploadedAt,
			views: result.views.toString(),
			thumbnail: result.thumbnail.url,
			requester: interaction.user
		})

		const buttonPlay = new MessageButton()
			.setCustomId("play")
			.setStyle("DANGER")
			.setLabel("Pause")

		const buttonSkip = new MessageButton()
			.setCustomId("skip")
			.setStyle("PRIMARY")
			.setLabel("Skip")

		const messageEmbed = new MessageEmbed()
			.setColor("#FF0000")
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL()
			)
			.setDescription(`[${result.title}](${result.url})`)
			.setImage(result.thumbnail.url)
			.addField("Duration", result.durationRaw, true)
			.addField("Uploaded", result.uploadedAt, true)
			.addField("Views", result.views.toString(), true)

		const messageActionRow = new MessageActionRow().addComponents(buttonPlay, buttonSkip)

		await interaction.editReply({
			content: "🎶 I've added a song to the queue.",
			embeds: [messageEmbed]
		})

		if (!queue.message) {
			queue.player.play(
				createAudioResource(audio.stream, {
					inputType: audio.type
				})
			)

			queue.connection.subscribe(queue.player)

			queue.connection.on(
				VoiceConnectionStatus.Disconnected,
				async (oldState, newState) => {
					try {
						await Promise.race([
							entersState(
								queue.connection,
								VoiceConnectionStatus.Signalling,
								5_000
							),
							entersState(
								queue.connection,
								VoiceConnectionStatus.Connecting,
								5_000
							)
						])
					} catch (err) {
						if (queue.connection) queue.connection.destroy()
					}
				}
			)

			queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
				queue.channelText.send(`🎶 I've left ${queue.channelVoice}`)
				interaction.client.queue.delete(interaction.guildId)
			})

			queue.connection.on(VoiceConnectionStatus.Ready, async () => {
				console.log(
					`(${interaction.guild.id}) ${interaction.guild.name}\tConnection has entered the 'ready' state, ready to play audio.`
				)

				queue.songs.shift()
				queue.message = await queue.channelText.send({
					content: "🎶 Now Playing!",
					embeds: [messageEmbed],
					components: [messageActionRow]
				})
			})

			queue.player.on(AudioPlayerStatus.Idle, async () => {
				console.log(
					`(${interaction.guild.id}) ${interaction.guild.name}\tPlayer has entered the 'idle' state, playing the next song.`
				)

				const song = queue.songs.shift()
				queue.message.delete()

				if (song) {
					audio = await youtube.stream(song.url)

					queue.player.play(
						createAudioResource(audio.stream, {
							inputType: audio.type
						})
					)

					messageEmbed
						.setColor("#FF0000")
						.setAuthor(
							song.requester.tag,
							song.requester.displayAvatarURL()
						)
						.setImage(song.thumbnail)
						.setDescription(`[${song.title}](${song.url})`)
						.addField("Duration", song.duration, true)
						.addField("Uploaded", song.uploadedAt, true)
						.addField("Views", song.views, true)

					queue.channelText
						.send({
							content: "🎶 Now Playing!",
							embeds: [messageEmbed],
							components: [messageActionRow]
						})
						.then((message) => (queue.message = message))
				} else {
					if (queue.connection) queue.connection.destroy()

					interaction.client.queue.delete(interaction.guildId)
					await queue.channelText.send(
						`🎶 I've left ${queue.channelVoice} as there are no more songs for me to play.`
					)
				}
			})
		}
	}
}
