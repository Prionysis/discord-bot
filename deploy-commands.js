require("dotenv").config()

const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { clientId, guildId, token } = require("./config.json")

const commands = []
const commandFiles = fs
    .readdirSync("./interactions/commands")
    .filter((file) => file.endsWith(".js"))

for (const file of commandFiles) {
    const command = require(`./interactions/commands/${file}`)
    commands.push(command.data.toJSON())
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN)

console.log("Started refreshing guild commands...")
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log("Successfully registered application commands."))
    .catch((err) => console.error(err))

console.log("Started refreshing global commands...")
rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log("Successfully registered global commands."))
    .catch((err) => console.error(err))