const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder,
    ButtonStyle
} = require('discord.js');
const {
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
    joinVoiceChannel
} = require('@discordjs/voice');
const youtube = require('play-dl');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Streams audio from the specified YouTube URL.')
        .addStringOption(option => option
            .setName('query')
            .setDescription('YouTube URL or search function.')
            .setRequired(true)),
    execute: async function (interaction) {
        if (!interaction.member.voice.channel) {
            return await interaction.reply({
                content: 'You\'re not in a voice channel.',
                ephemeral: true
            });
        }

        await interaction.deferReply();

        const query = interaction.options.getString('query');
        const results = await youtube.search(query, {limit: 1});
        const result = results[0];

        let audio = await youtube.stream(result.url);
        let queue = interaction.client.queue.get(interaction.guild.id);

        if (!queue) {
            interaction.client.queue.set(interaction.guildId, queue = {
                connection: joinVoiceChannel({
                    channelId: interaction.member.voice.channelId,
                    guildId: interaction.guildId,
                    adapterCreator: interaction.member.voice.guild.voiceAdapterCreator
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
            });

            await interaction.editReply(`🎶 I've joined ${queue.channelVoice}`);
        }

        queue.songs.push({
            url: result.url,
            title: result.title,
            duration: result.durationRaw,
            uploadedAt: result.uploadedAt,
            views: result.views.toString(),
            thumbnail: result.thumbnails[0].url,
            requester: interaction.user
        });

        const buttonPlay = new ButtonBuilder()
            .setCustomId('play')
            .setStyle(ButtonStyle.Danger)
            .setLabel('Pause');

        const buttonSkip = new ButtonBuilder()
            .setCustomId('skip')
            .setStyle(ButtonStyle.Primary)
            .setLabel('Skip');

        const messageEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`[${result.title}](${result.url})`)
            .setImage(result.thumbnails[0].url)
            .addFields({
                name: 'Duration',
                value: result.durationRaw,
                inline: true
            }, {
                name: 'Uploaded',
                value: result.uploadedAt,
                inline: true
            }, {
                name: 'Views',
                value: result.views.toString(),
                inline: true
            });

        const messageActionRow = new ActionRowBuilder().addComponents(buttonPlay, buttonSkip);

        await interaction.editReply({
            content: '🎶 I\'ve added a song to the queue.',
            embeds: [messageEmbed]
        });

        if (!queue.message) {
            queue.player.play(createAudioResource(audio.stream, {inputType: audio.type}));
            queue.connection.subscribe(queue.player);

            queue.connection.on(VoiceConnectionStatus.Disconnected, async () => {
                try {
                    await Promise.race([entersState(queue.connection, VoiceConnectionStatus.Signalling, 5_000), entersState(queue.connection, VoiceConnectionStatus.Connecting, 5_000)]);
                } catch (err) {
                    if (queue.connection) {
                        queue.connection.destroy();
                    }
                }
            });

            queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
                queue.channelText.send(`🎶 I've left ${queue.channelVoice}`);
                interaction.client.queue.delete(interaction.guildId);
            });

            queue.connection.on(VoiceConnectionStatus.Ready, async () => {
                console.log(`(${interaction.guild.id}) ${interaction.guild.name}\tConnection has entered the 'ready' state, ready to play audio.`);

                queue.songs.shift();
                queue.message = await queue.channelText.send({
                    content: '🎶 Now Playing!',
                    embeds: [messageEmbed],
                    components: [messageActionRow]
                });
            });

            queue.player.on(AudioPlayerStatus.Idle, async () => {
                console.log(`(${interaction.guild.id}) ${interaction.guild.name}\tPlayer has entered the 'idle' state, playing the next song.`);

                const song = queue.songs.shift();

                queue.message.delete();

                if (song) {
                    audio = await youtube.stream(song.url);

                    queue.player.play(createAudioResource(audio.stream, {
                        inputType: audio.type
                    }));

                    messageEmbed
                        .setColor('#FF0000')
                        .setAuthor({
                            name: song.requester.tag,
                            iconURL: song.requester.displayAvatarURL()
                        })
                        .setImage(song.thumbnail)
                        .setDescription(`[${song.title}](${song.url})`)
                        .addFields({
                            name: 'Duration',
                            value: song.duration,
                            inline: true
                        }, {
                            name: 'Uploaded',
                            value: song.uploadedAt,
                            inline: true
                        }, {
                            name: 'Views',
                            value: song.views,
                            inline: true
                        });

                    queue.channelText
                        .send({
                            content: '🎶 Now Playing!',
                            embeds: [messageEmbed],
                            components: [messageActionRow]
                        })
                        .then(message => (queue.message = message));
                } else {
                    if (queue.connection) queue.connection.destroy();

                    interaction.client.queue.delete(interaction.guildId);
                    await queue.channelText.send(`🎶 I've left ${queue.channelVoice} as there are no more songs for me to play.`);
                }
            });
        }
    }
};
