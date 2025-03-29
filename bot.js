const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const { GoogleGenAI } = require('@google/genai');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const channelId = '1354929611569631562';
const geminiApiKey = 'AIzaSyDgBsqdasDeVMnjrK6rxTSKJn5jGWyR-7I';

const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function generateResponse(messageContent) {
    // Append updated instructions for gemini with sentence splitting handling
    const formattedMessage = messageContent + "\n\nNote: If any code sections in your response exceed 2000 characters, please split them into chunks. For each chunk, enclose it within triple backticks (```), starting with a ``` line at the beginning and ending with a ``` line at the end, and apply Discord’s markdown stylizing as usual. Additionally, if a sentence is about to be split in half at the 2000 character limit, do not break it arbitrarily; instead, send the remaining part of the sentence in the next message, using extra spaces or another clear method to indicate continuation.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: formattedMessage
        });
        let responseText = response.text;
        const chunks = [];
        while (responseText.length > 0) {
            chunks.push(responseText.substring(0, 2000));
            responseText = responseText.substring(2000);
        }
        return chunks;
    } catch (error) {
        console.error('Error generating content:', error);
        return ['Sorry, I could not process your request.'];
    }
}

client.on('messageCreate', async (message) => {
    if (message.channel.id !== channelId || message.author.bot) return;
    
    // Handle commands
    if (message.content.startsWith('/')) {
        const args = message.content.split(' ');
        const command = args[0].substring(1);
        if (command === 'clear') {
            const num = parseInt(args[1], 10);
            if (isNaN(num) || num < 1) {
                message.channel.send("Invalid number of messages to clear.");
                return;
            }
            try {
                const fetched = await message.channel.messages.fetch({ limit: num });
                await message.channel.bulkDelete(fetched, true);
                const confirmationMsg = await message.channel.send(`Deleted ${fetched.size} messages.`);
                setTimeout(() => {
                    confirmationMsg.delete().catch(console.error);
                }, 3000);
            } catch (error) {
                console.error('Error deleting messages:', error);
                message.channel.send("Failed to delete messages.");
            }
        }
        return;
    }
    
    // Process non-command messages
    const responseChunks = await generateResponse(message.content);
    for (const chunk of responseChunks) {
        if (chunk.trim()) { // Ensure the chunk is not empty
            message.channel.send(chunk);
        }
    }
});

client.once('ready', () => {
    console.log('Bot is online!');
});

client.login('MTMzODQwOTM5MDcyOTk4NjA2OA.GwdgTL.0jHPk3nH7kmmRSe6A6zUX0jildOfuAgk5bWbM0');