//hihi botbot

const { Client, Intents } = require('discord.js');
const { registerInteractions } = require('./interactions');
require('dotenv').config();

const { kKonjugator } = require("./scripts/konjugator");

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

client.on('ready', () => {
    console.log('\nBot is online!\n');
    registerInteractions();
});

client.on('messageCreate', (message) => {
    const text = message.content;
    const textArray = text.split(' ');
    if (message.author.id === process.env.CLIENT_ID);
    else if (text.includes('!k')) {
        if (!process.env.BOT_ACTIVE_CHANNEL.split(",").includes(message.channel.id))
            message.channel.send(`${message.author},plz type this in the correct channel!`)
        else if (textArray.length === 4)
            message.reply(kKonjugator(textArray[1], textArray[2], textArray[3]))
        else
            message.channel.send(`${message.author},To conjugate, type:

            !k [dictionary form of verb to conjugate] [level] [tense]

            levels to choose from: informalLow, informalHigh, formalHigh
            tenses to choose from: past, present, future

            Here's an example!
            !k 먹다 informalHigh past`);
    };
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'conjugate') {
        await interaction.reply({
            content: kKonjugator(
                interaction.options.getString('verb'),
                interaction.options.getString('level'),
                interaction.options.getString('tense')
            )
        });
    }
});

client.login(process.env.ACCESS_TOKEN);
