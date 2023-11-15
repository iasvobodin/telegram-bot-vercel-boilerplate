import { Telegraf, Markup, Context } from 'telegraf';
import { sql } from '@vercel/postgres';
import { code } from 'telegraf/format'
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
// bot.on('message', greeting());

const additionalButtons = Markup.inlineKeyboard([
	Markup.button.callback('Заявка на производство', 'production_request'),
	Markup.button.callback('Обозначение изделия', 'product_designation'),
	Markup.button.callback('Чертёжный индекс изделия', 'technical_index'),
]);

interface UserState {
	stage: number;
	productionRequest?: string;
	productDesignation?: string;
	technicalIndex?: string;
}

let userState: { [userId: number]: UserState } = {};

bot.action('create_new', (ctx: Context) => {
	ctx.editMessageText('Добавляем новый шкаф.\nВведите\nЗаявку на производство:');
	userState[ctx.from!.id] = { stage: 1 };
});

bot.on('text', async (ctx) => {
	const userId = ctx.from.id;
	const currentState = userState[userId];

	if (currentState) {
		switch (currentState.stage) {
			case 1:
				currentState.productionRequest = ctx.message.text;
				currentState.stage++;
				ctx.reply('Обозначение изделия:');
				break;
			case 2:
				currentState.productDesignation = ctx.message.text;
				currentState.stage++;
				ctx.reply('Чертёжный индекс изделия:');
				break;
			case 3:
				currentState.technicalIndex = ctx.message.text;

				// Добавление в базу данных
				// await ctx.reply(code('save on db'))
				// ctx.replyWithHTML('<i>Обработка запроса...</i>');
				await sql`INSERT INTO Pets (Name, Owner) VALUES (${ctx.message.text}, ${ctx.message.text});`;


				ctx.reply('Новый шкаф добавлен в бд');
				delete userState[userId]; // Очистка состояния
				break;

		}
	}
});



bot.action('choose_current', async (ctx) => {
	const pets = await sql`SELECT * FROM Pets;`;
	ctx.reply(JSON.stringify(pets));

});





// bot.action('create_new', (ctx) => {
// 	ctx.editMessageText('Новый шкаф в бд', additionalButtons);
// });

// bot.action('choose_current', (ctx) => {
// 	// ctx.reply('Вы выбрали "Выбрать текущий".');
// 	ctx.reply('Заявка на производство:');
// 	bot.on('text', async (ctx) => {
// 		await sql`INSERT INTO Pets (Name, Owner) VALUES (${ctx.message.text}, ${ctx.message.text});`;
// 	});

// 	ctx.reply('Обозначение изделия:');
// 	bot.on('text', async (ctx) => {
// 		await sql`INSERT INTO Pets (Name, Owner) VALUES (${ctx.message.text}, ${ctx.message.text});`;
// 	});

// 	ctx.reply('Чертёжный индекс изделия:');
// 	bot.on('text', async (ctx) => {
// 		await sql`INSERT INTO Pets (Name, Owner) VALUES (${ctx.message.text}, ${ctx.message.text});`;
// 	});
// 	ctx.reply('Шкаф добавлен в бд');

// });


bot.action('production_request', async (ctx: Context) => {
	ctx.reply('Введите Заявку на производство:');
	bot.on('text', async (ctx) => {
		await sql`INSERT INTO Pets (Name, Owner) VALUES (${ctx.message.text}, ${ctx.message.text});`;
		// const note = new Note({ text: ctx.message.text });
		// await note.save();
		ctx.reply('Замечание сохранено в базе данных.');
	});
	// ctx.editMessageText('Введите Заявку на производство:');
	// const messageId = ctx.message?.message_id;

	// bot.on('message', greeting());
});

bot.action('product_designation', (ctx) => {
	ctx.reply('Введите Обозначение изделия:');
});

bot.action('technical_index', (ctx) => {
	ctx.reply('Введите Чертёжный индекс изделия:');
});






//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
	await production(req, res, bot);
};
//dev mode
ENVIRONMENT !== 'production' && development(bot);
