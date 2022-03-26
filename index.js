require("dotenv").config()

const fs = require("fs")
const { Client, Collection, Intents } = require("discord.js")

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.DIRECT_MESSAGES,
    ],
    partials: ["CHANNEL", "MESSAGE"],
})

client.queue = new Map()
client.buttons = new Collection()
client.commands = new Collection()

// Loads all the buttons from the "buttons" folder.
console.log(`Loading buttons...`)
const buttonFiles = fs.readdirSync("./interactions/buttons").filter((file) => file.endsWith(".js"))

for (const buttonFile of buttonFiles) {
    const button = require(`./interactions/buttons/${buttonFile}`)
    client.buttons.set(button.name, button)
}

// Loads all the commands from the "commands" folder.
console.log(`Loading commands...`)
const commandFiles = fs.readdirSync("./interactions/commands").filter((file) => file.endsWith(".js"))

for (const commandFile of commandFiles) {
    const command = require(`./interactions/commands/${commandFile}`)
    client.commands.set(command.data.name, command)
}

// Loads all the events from the "events" folder.
console.log(`Loading events...`)
const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".js"))

for (const eventFile of eventFiles) {
    const event = require(`./events/${eventFile}`)

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

client.login(process.env.TOKEN)
