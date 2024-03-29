const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('8Ball reaches into the future to find the answers.')
        .addStringOption(option => option
            .setName('question')
            .setDescription('The question to answer.')
            .setRequired(true)),
    execute: async function (interaction) {
        const user = interaction.client.user;
        const question = interaction.options.getString('question');
        const answers = [
            'It is certain.',
            'It is decidedly so.',
            'Without a doubt.',
            'Yes, definitely.',
            'You may rely on it.',
            'As I see it, yes.',
            'Most likely.',
            'Outlook good.',
            'Yes.',
            'Signs point to yes.',
            'Reply hazy, try again',
            'Ask again later.',
            'Better not tell you now.',
            'Cannot predict now.',
            'Concentrate and ask again.',
            'Don\'t count on it.',
            'My reply is no.',
            'My sources say no.',
            'Outlook not so good.',
            'Very doubtful.'
        ];

        const messageEmbed = new EmbedBuilder()
            .setColor('#CDEAE0')
            .setAuthor({
                name: '8Ball',
                iconURL: user.avatarURL()
            })
            .addFields({
                name: 'Question',
                value: question
            }, {
                name: 'Answer',
                value: answers[Math.floor(Math.random() * answers.length)]
            });

        await interaction.reply({
            embeds: [messageEmbed]
        });
    }
};
