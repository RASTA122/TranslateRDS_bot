import express from 'express';
import { Telegraf } from 'telegraf';
import translate from '@vitalets/google-translate-api';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
const userLangPrefs = {};

bot.start((ctx) => {
  ctx.reply('Witaj! Wyślij tekst, a ja go przetłumaczę. Użyj /setlang <kod> aby ustawić język docelowy.');
});

bot.command('setlang', (ctx) => {
  const parts = ctx.message.text.split(' ');
  if (parts.length !== 2) {
    return ctx.reply('Użycie: /setlang <kod_języka>, np. /setlang en');
  }
  const lang = parts[1].toLowerCase();
  userLangPrefs[ctx.from.id] = lang;
  ctx.reply(`Ustawiono język docelowy na: ${lang}`);
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const targetLang = userLangPrefs[ctx.from.id] || process.env.TARGET_LANG || 'pl';
  try {
    const res = await translate(text, { to: targetLang });
    ctx.reply(res.text);
  } catch (error) {
    console.error('Błąd tłumaczenia:', error);
    ctx.reply('Wystąpił błąd podczas tłumaczenia.');
  }
});

app.use(express.json());

app.post('/telegram', (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});