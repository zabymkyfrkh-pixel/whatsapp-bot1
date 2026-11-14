js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('Bot is running'); });
app.listen(PORT, () => console.log('Server running on ' + PORT));

const GEMINI_API_KEY = "AQ.Ab8RN6Km-9hfJlrZSEAx48BMHL4tU1jWqwxeDTdaY8aZHVyFTw";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: require('puppeteer').executablePath(),
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process', '--no-zygote']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('امسح الكود');
});

client.on('ready', () => {
    console.log('البوت جاهز!');
});

client.on('message', async (msg) => {
    if (msg.from === 'status@broadcast') return;
    if (msg.body.startsWith('!')) return;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: msg.body }] }] })
        });
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'ما فهمتش، عاود';
        msg.reply(reply);
    } catch (e) {
        console.log(e);
        msg.reply('صار خطأ، حاول مرة ثانية');
    }
});

client.initialize();
