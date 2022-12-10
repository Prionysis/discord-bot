const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Information about a user, role or the server.')
        .addSubcommand(subCommand => subCommand
            .setName('user')
            .setDescription('Shows information for the specified user.')
            .addUserOption(option => option
                .setName('user')
                .setDescription('The user to get information from.')
                .setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('role')
            .setDescription('Shows information for the specified role.')
            .addRoleOption(option => option
                .setName('role')
                .setDescription('The role to get information from.')
                .setRequired(true)))
        .addSubcommand(subCommand => subCommand
            .setName('server')
            .setDescription('Shows some server information.')),
    execute: async function (interaction) {
        const subCommand = interaction.options.getSubcommand();

        if (subCommand === 'role') {
            const role = interaction.options.getRole('role');
            const messageEmbed = new EmbedBuilder()
                .setColor('#CDEAE0')
                .setColor(role.hexColor)
                .setTitle('Role Information')
                .addFields({
                    name: 'Name',
                    value: role.name,
                    inline: true
                }, {
                    name: 'Position',
                    value: role.position.toString(),
                    inline: true
                }, {
                    name: 'Hexadecimal Color',
                    value: role.hexColor.toUpperCase(),
                    inline: true
                }, {
                    name: 'Members',
                    value: role.members.size.toString(),
                    inline: true
                }, {
                    name: 'Mentionable',
                    value: role.mentionable ? 'Yes' : 'No',
                    inline: true
                }, {
                    name: 'Created',
                    value: role.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    inline: true
                });

            await interaction.reply({
                embeds: [messageEmbed]
            });
        } else if (subCommand === 'user') {
            const user = interaction.options.getUser('user');
            const messageEmbed = new EmbedBuilder()
                .setColor('#CDEAE0')
                .setAuthor({
                    name: user.tag,
                    iconURL: user.avatarURL()
                })
                .setThumbnail(user.avatarURL({size: 2048}))
                .setImage(user.avatarURL({size: 2048}))
                .addField({
                    name: 'Nickname',
                    value: user.username,
                    inline: true
                });

            await interaction.reply({
                embeds: [messageEmbed]
            });
        } else if (subCommand === 'server') {
            const messageEmbed = new EmbedBuilder()
                .setColor('#CDEAE0')
                .setAuthor({
                    name: interaction.guild.name,
                    iconURL: interaction.guild.iconURL
                })
                .setThumbnail(interaction.guild.iconURL)
                .addFields({
                    name: 'Owner',
                    value: `<@${interaction.guild.ownerId}>`,
                    inline: true
                }, {
                    name: 'Created',
                    value: interaction.guild.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    inline: true
                }, {
                    name: 'Roles',
                    value: interaction.guild.roles.cache.size.toString(),
                    inline: true
                }, {
                    name: 'Members',
                    value: interaction.guild.memberCount.toString(),
                    inline: true
                });

            await interaction.reply({
                embeds: [messageEmbed]
            });
        }
    }
};
