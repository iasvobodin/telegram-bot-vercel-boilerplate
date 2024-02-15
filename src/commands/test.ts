// test.ts
import { Context, Telegraf } from 'telegraf';

const fruits = ['Apple', 'Banana', 'Orange', 'Grapes', 'Mango', 'Pineapple', 'Strawberry', 'Watermelon', 'Cherry', 'Kiwi', 'Pear', 'Plum', 'Peach', 'Blueberry', 'Raspberry', 'Blackberry', 'Cranberry', 'Pomegranate', 'Avocado', 'Coconut', 'Guava', 'Papaya', 'Passion Fruit', 'Dragon Fruit', 'Fig', 'Date', 'Lemon', 'Lime', 'Grapefruit'];

export const testCommand = async (ctx: Context, bot: Telegraf) => {
  const pageSize = 5;
  let currentPage = 0;

  const sendFruits = async () => {
    const startIdx = currentPage * pageSize;
    const endIdx = startIdx + pageSize;

    const fruitButtons = fruits.slice(startIdx, endIdx).map(fruit => ({ text: fruit }));

    const paginationButtons = [
      { text: '<<', callback_data: 'prev' },
      { text: `${currentPage + 1}/${Math.ceil(fruits.length / pageSize)}`, callback_data: 'page' },
      { text: '>>', callback_data: 'next' },
    ];

    const keyboard = [...Array(pageSize).keys()].map(i => [fruitButtons[i]]);

    return ctx.reply('Choose a fruit:', {
      reply_markup: {
        inline_keyboard: [...keyboard, paginationButtons],
      },
    });
  };

  await sendFruits();

  bot.action('prev', async () => {
    if (currentPage > 0) {
      currentPage -= 1;
      await sendFruits();
    }
  });

  bot.action('next', async () => {
    if (currentPage < Math.ceil(fruits.length / pageSize) - 1) {
      currentPage += 1;
      await sendFruits();
    }
  });

  bot.action('page', async (ctx) => {
    // Handle pagination if needed
  });

  bot.on('text', (ctx) => {
    const selectedFruit = ctx.message.text;
    ctx.reply(`You chose ${selectedFruit}`);
  });
};
