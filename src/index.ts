import { Telegraf } from 'telegraf';

import { about } from './commands';
import { error } from './commands';
import { greeting } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

bot.command('about', about());
bot.command('error', error());
bot.on('message', greeting());

bot.action('create_new', (ctx) => {
  ctx.reply('Вы выбрали "Создать новый".');
});

bot.action('choose_current', (ctx) => {
  ctx.reply('Вы выбрали "Выбрать текущий".');
});


//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
