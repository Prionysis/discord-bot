const {
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require('discord.js');
const {AudioPlayerStatus} = require('@discordjs/voice');

module.exports = {
    name: 'play',
    execute: async function (interaction) {
        const queue = interaction.client.queue.get(interaction.guild.id);

        if (!queue || !interaction.member.voice.channel || interaction.member.voice.channel !== queue.channelVoice) {
            return interaction.deferUpdate();
        }

        const buttonPlay = ButtonBuilder.from(interaction.component);
        const status = queue.player.state.status;

        // TODO: In discord.js v14 you can no longer directly change the button, you must update the action row https://stackoverflow.com/a/73108750
        if (status === AudioPlayerStatus.Playing) {
            buttonPlay.setStyle(ButtonStyle.Success).setLabel('Resume');

            queue.player.pause();
        } else {
            buttonPlay.setStyle(ButtonStyle.Danger).setLabel('Pause');

            queue.player.unpause();
        }

        interaction.update({
            components: interaction.message.components
        });
    }
};
