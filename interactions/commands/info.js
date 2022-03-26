const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("info")
		.setDescription("Information about a user, role or the server.")
		.addSubcommand(subCommand => subCommand
			.setName("user")
			.setDescription("Shows information for the specified user.")
			.addUserOption(option => option
				.setName("user")
				.setDescription("The user to get information from.")
				.setRequired(true)))

		.addSubcommand(subCommand => subCommand
			.setName("role")
			.setDescription("Shows information for the specified role.")
			.addRoleOption(option => option
				.setName("role")
				.setDescription("The role to get information from.")
				.setRequired(true)))

		.addSubcommand(subCommand => subCommand
			.setName("server")
			.setDescription("Shows some server information.")),

	async execute (interaction) {
		const subCommand = interaction.options.getSubcommand()

		if (subCommand === "role") {
			const role = interaction.options.getRole("role")
			const messageEmbed = new MessageEmbed()
				.setColor("#CDEAE0")
				.setColor(role.hexColor)
				.setTitle("Role Information")
				.addField("Name", role.name, true)
				.addField("Position", role.position.toString(), true)
				.addField("Hexadecimal Color", role.hexColor.toUpperCase(), true)
				.addField("Members", role.members.size.toString(), true)
				.addField("Mentionable", role.mentionable ? "Yes" : "No", true)
				.addField("Created", role.createdAt.toLocaleDateString("en-US", {
					year: "numeric", month: "long", day: "numeric"
				}), true)

			await interaction.reply({ embeds: [messageEmbed] })
		} else if (subCommand === "user") {
			const user = interaction.options.getUser("user")
			const messageEmbed = new MessageEmbed()
				.setColor("#CDEAE0")
				.setAuthor({
					name: user.tag, iconURL: user.avatarURL()
				})
				.setThumbnail(user.avatarURL({ size: 2048 }))
				.setImage(user.avatarURL({ size: 2048 }))
				.addField("Nickname", user.username, true)

			await interaction.reply({ embeds: [messageEmbed] })
		} else if (subCommand === "server") {
			const messageEmbed = new MessageEmbed()
				.setColor("#CDEAE0")
				.setAuthor({
					name: interaction.guild.name, iconURL: interaction.guild.iconURL
				})
				.setThumbnail(interaction.guild.iconURL)
				.addField("Owner", `<@${interaction.guild.ownerId}>`, true)
				.addField("Created", interaction.guild.createdAt.toLocaleDateString("en-US", {
					year: "numeric", month: "long", day: "numeric"
				}), true)
				.addField("Roles", interaction.guild.roles.cache.size.toString(), true)
				.addField("Members", interaction.guild.memberCount.toString(), true)

			await interaction.reply({ embeds: [messageEmbed] })
		}
	}
}
