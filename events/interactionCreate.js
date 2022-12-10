module.exports = {
    name: 'interactionCreate',
    on: true,
    async execute(interaction) {
        const client = interaction.client;

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                return;
            }

            try {
                console.log(`(${interaction.guild.id}) ${interaction.guild.name}\t${interaction.user.tag} triggered the '${command.data.name}' command in #${interaction.channel.name}.`);

                await command.execute(interaction);
            } catch (err) {
                console.error(err);

                return interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        } else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);

            if (!button) {
                return;
            }

            try {
                console.log(`(${interaction.guild.id}) ${interaction.guild.name}\t${interaction.user.tag} triggered the '${button.name}' button in #${interaction.channel.name}.`);

                await button.execute(interaction);
            } catch (err) {
                console.error(err);

                return interaction.followUp({
                    content: 'There was an error while executing this button!',
                    ephemeral: true
                });
            }
        }
    }
};