const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "messageCreate", once: true, async execute (message) {
        const client = message.client

        // Check if the message comes from the specified channel and has an attachment
        if (message.channelId === "892740012435722270") {
            // Filter mentioned channels where the bot is able to send messages
            const channels = message.mentions.channels
                .filter(channel => channel.permissionsFor(client.user).has(["SEND_MESSAGES"]))
                .map(channel => client.channels.cache.get(channel.id))

            for (const channel of channels) {
                const messageEmbed = new MessageEmbed()
                    .setAuthor({
                        name: message.member.tag, iconURL: message.member.avatarURL()
                    })

                await channel.send({
                    embeds: [messageEmbed],
                    files: Array.from(message.attachments.values())
                })
            }
        }
    }
}