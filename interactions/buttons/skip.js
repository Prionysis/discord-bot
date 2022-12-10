module.exports = {
    name: 'skip',
    execute: async function (interaction) {
        const queue = interaction.client.queue.get(interaction.guild.id);

        if (!queue || !interaction.member.voice.channel || interaction.member.voice.channel !== queue.channelVoice) {
            return interaction.deferUpdate();
        }

        queue.player.stop();

        await interaction.deferUpdate();
    }
};
