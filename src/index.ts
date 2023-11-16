import { Telegraf, Markup, Context } from 'telegraf';
import { message } from 'telegraf/filters'
import { sql } from '@vercel/postgres';
import { about } from './commands';
import { error } from './commands';
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

type UserState = {
	stage?: number;
	productionRequest?: string;
	productDesignation?: string;
	technicalIndex?: string;
}

let userState: { [userId: number]: UserState } = {};

bot.action('create_new', (ctx: Context) => {
	ctx.editMessageText('Добавляем новый шкаф.\nВведите\n\nЗаявку на производство:');
	userState[ctx.from!.id] = { stage: 1 };
});

const saveKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Сохранить', 'save_new'),
    Markup.button.callback('Отмена', 'cancel_new'),
  ]);

const newCabinet: UserState = {}

bot.on(message('text'), async (ctx) => {
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
				// currentState.stage++;
				ctx.reply(`
				\nЗаявка на производство: ${currentState.productionRequest}
				\nОбозначение изделия: ${currentState.productDesignation}
				\nЧертёжный индекс изделия: ${currentState.technicalIndex}
				`, saveKeyboard);

				newCabinet.productionRequest = currentState.productionRequest
				newCabinet.productDesignation = currentState.productDesignation
				newCabinet.technicalIndex = currentState.technicalIndex


				// Добавление в базу данных
				// await ctx.reply(code('save on db'))
				// ctx.replyWithHTML('<i>Обработка запроса...</i>');
				break;
			// case 4:
					
			// 	await sql`INSERT INTO Pets (Name, Owner) VALUES (${ctx.message.text}, ${ctx.message.text});`;
			// 	ctx.reply('Новый шкаф добавлен в бд');
			// 	delete userState[userId]; // Очистка состояния
			// 	break;

		}
	}
});

bot.action('save_new', async (ctx) => {
	console.log(newCabinet);
	
	await sql`INSERT INTO Cabinets (Productionrequest, Productdesignation, Technicalindex) VALUES (${newCabinet.productionRequest}, ${newCabinet.productDesignation}, ${newCabinet.technicalIndex});`;
	ctx.editMessageText('Новый шкаф добавлен в бд');
});





bot.action('choose_current', async (ctx) => {
	// await sql`DELETE FROM Cabinets;`;
	const Cabinets = await sql`SELECT * FROM Cabinets;`;
	console.log(Cabinets.rows);
	ctx.reply(JSON.stringify(Cabinets.rows.map(e => e.productionrequest)[0]));

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
