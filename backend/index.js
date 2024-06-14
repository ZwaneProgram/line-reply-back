const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Load environment variables from .env file if available
require('dotenv').config();

// Parse application/json
app.use(bodyParser.json());

// POST endpoint for receiving messages from LINE
app.post('/webhook', (req, res) => {
    console.log('Received data:', req.body);

    const { events } = req.body;

    // Ensure events array exists and is not empty
    if (events && events.length > 0) {
        const event = events[0]; // Only handle the first event

        if (event.type === 'message' && event.message.type === 'text') {
            const messageText = event.message.text.toLowerCase();
            let replyText = '';

            if (messageText === 'hello') {
                replyText = 'yes hi';
            }

            // Send a reply message
            replyMessage(event.replyToken, replyText)
                .then(() => res.sendStatus(200))
                .catch((error) => {
                    console.error('Error sending reply message:', error);
                    res.sendStatus(500);
                });
            return; // Exit the handler after replying
        }
    }

    // No valid event found or no 'hello' message, send a 200 response
    res.sendStatus(200);
});

// Function to send reply message to LINE
async function replyMessage(replyToken, replyText) {
    const LINE_API = 'https://api.line.me/v2/bot/message/reply';

    await axios.post(LINE_API, {
        replyToken: replyToken,
        messages: [{
            type: 'text',
            text: replyText
        }]
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.LINE_ACCESS_TOKEN}`
        }
    });
}

app.listen(port, () => {
    console.log(`Line chatbot listening at http://localhost:${port}`);
});
