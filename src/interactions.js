const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const commands = [{
    name: 'conjugate',
    description: 'Conjugate a verb',
    type: 1,
    options: [{
        type: 3,
        name: 'verb',
        description: 'Word to be conjugated',
        required: true
    }, {
        type: 3,
        name: 'level',
        description: 'Formality level',
        required: true,
        choices: [{
            name: 'informal-low',
            value: 'informalLow'
        }, {
            name: 'informal-high',
            value: 'informalHigh'
        }, {
            name: 'formal-high',
            value: 'formalHigh'
        }]
    }, {

        type: 3,
        name: 'tense',
        description: 'Formality level',
        required: true,
        choices: [{
            name: 'past',
            value: 'past'
        }, {
            name: 'present',
            value: 'present'
        }, {
            name: 'future',
            value: 'future'
        }]
    }]
}];

const rest = new REST({ version: '9' }).setToken(process.env.ACCESS_TOKEN);

async function registerInteractions() {
    try {
        const serverIds = process.env.SERVER_IDS.split(",");
        for (serverId of serverIds) {
            console.log('Started refreshing application (/) commands in ' + serverId);

            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, serverId),
                { body: commands },
            );

            console.log('Successfully reloaded application (/) commands in ' + serverId);
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    registerInteractions
}
