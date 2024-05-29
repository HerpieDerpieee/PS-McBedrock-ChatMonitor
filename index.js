const bedrock = require('bedrock-protocol');
const axios = require('axios');
const { username, webhook, serverip, serverport } = require("./config.json");
const client = bedrock.createClient({ // make sure you have setup bedrock-protocol, and use the correct username, otherwise it WILL NOT WORK
    host: serverip,
    port: serverport,
    username: username,
    offline: false // true if server is cracked, and allows cracked accounts
});

const webhookUrl = webhook;

function formatMessage(packet) {
    const playerName = packet.parameters[0];
    const secondParameter = packet.parameters[1];
    let killer = '';

    if (packet.message.includes('fell.accident')) {
        return `${playerName} fell from a high place`;
    }else if (packet.message.includes("multiplayer")){
        if (packet.message = "§e%multiplayer.player.joined") return `${packet.parameters[0]} joined the game`
        if (packet.message = "§e%multiplayer.player.left") return `${packet.parameters[0]} left the game`
    } else if (secondParameter) {
        if (secondParameter.startsWith('%entity.')) {
            const entityType = secondParameter.split('.')[1]; // Getting the entity type directly after %entity
            killer = entityType.charAt(0).toUpperCase() + entityType.slice(1);
            return `${playerName} was killed by ${killer}`;
        } else {
            killer = secondParameter.charAt(0).toUpperCase() + secondParameter.slice(1);
            return `${playerName} was killed by ${killer}`;
        }
    } else {
        const messageParts = packet.message.split('.');
        const cause = messageParts[2] ? messageParts[2] : 'unknown cause';
        return `${playerName} died due to ${cause}`;
    }
}

client.on('text', (packet) => {
    console.log(packet);

    let color = 3447003; // Default blue
    let title = packet.source_name || 'Server';
    let description = packet.message;

    if (packet.needs_translation && packet.message.startsWith('death.')) {
        color = 0xFF0000;
        title = `☠️ ${packet.parameters[0]}`;
        description = formatMessage(packet);
    } else if (packet.type === 'chat' && packet.source_name) {
        color = 0x00FF00; // Green color for chat messages
    } else if (packet.type === 'translation' && packet.message.includes("multiplayer")) {
        color = 0x0000FF
        let temp;
        if (packet.message == "§e%multiplayer.player.joined") temp = `${packet.parameters[0]} joined the game`;
        if (packet.message == "§e%multiplayer.player.left") temp = `${packet.parameters[0]} left the game`;
        description = temp;
    }

    const embed = {
        embeds: [{
            title: title,
            description: description,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Minecraft Bedrock Server'
            }
        }]
    };

    // Send the embed to Discord
    axios.post(webhookUrl, embed)
        .then(response => console.log('Embed sent to Discord'))
        .catch(error => console.error('Failed to send embed:', error));
});