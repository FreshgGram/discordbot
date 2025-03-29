const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const channelId = '1354929611569631562';
const geminiApiKey = 'AIzaSyBSJLC087GhBtVIvqbFcZXEZbhn8pWB_a4';

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.channel.id === channelId && !message.author.bot) {
        try {
            const response = await axios.post('https://gemini-api-url.com/ask', {
                question: message.content,
                apiKey: geminiApiKey
            });
            message.channel.send(response.data.answer);
        } catch (error) {
            console.error('Error communicating with Gemini API:', error);
            message.channel.send('Sorry, I could not process your request.');
        }
    }
});

client.login('MTMzODQwOTM5MDcyOTk4NjA2OA.GwdgTL.0jHPk3nH7kmmRSe6A6zUX0jildOfuAgk5bWbM0');