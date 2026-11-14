
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => { res.send('البوت شغال!'); });
app.listen(PORT, () => console.log('Server running'));

const GEMINI_API_KEY =  "AQ.Ab8RN6Km-9hfJlrZSEAx48BMHL4tU1jWqwxeDTdaY8aZHVyFTw";

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('امسح الكود');
});

client.on('ready', () => { console.log('البوت جاهز!'); });

let chats = {};

async function askAI(userId, text) {
  if (!chats[userId]) chats[userId] = [];
  chats[userId].push({ role: "user", parts: [{ text: text }] });
  if (chats[userId].length > 10) chats[userId] = chats[userId].slice(-10);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: chats[userId],
        systemInstruction: { parts: [{ text: "انت مساعد ذكاء اصطناعي قوي زي ChatGPT و Meta AI و Gemini. اسمك صاحبي. تفهم كل شي: اسئلة، واجبات، ترجمة، كتابة، برمجة، نصائح. رد باللهجة الليبية لما يدردش معاك، وبالعربي الفصحى او الانجليزي لما يسألك سؤال علمي. خفيف دم وذكي." }] }
      })
    });
    const data = await res.json();
    const reply = data.candidates[0].content.parts[0].text;
    chats[userId].push({ role: "model", parts: [{ text: reply }] });
    return reply;
  } catch (e) {
    return 'صارت مشكلة في العقل، عاود ابعتلي 😅';
  }
}

client.on('message', async msg => {
  if (msg.fromMe) return;
  if (msg.body.startsWith('!')) return;
  const reply = await askAI(msg.from, msg.body);
  msg.reply(reply);
});

client.initialize();
