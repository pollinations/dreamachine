import tmi from 'tmi.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new tmi.Client({
  options: { debug: true },
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: process.env.TWITCH_CHANNEL_NAME,
    password: process.env.TWITCH_OAUTH_TOKEN,
  },
  channels: [ process.env.TWITCH_CHANNEL_NAME],
});



client.connect();




export const registerListener = (callback) => {
    client.on('message', (channel, tags, message, self) => {
        // Ignore echoed messages
        if (self) return;
      
        console.log(`Received message: ${message}`);
        callback(message);
      }); 
};      