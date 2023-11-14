import { Context, Markup } from 'telegraf';

const error = () => async (ctx: Context) => {
  const errorText = 'Добавление ошибки на шкаф';

  const keyboard = Markup.inlineKeyboard([
    Markup.button.callback('Создать новый', 'create_new'),
    Markup.button.callback('Выбрать текущий', 'choose_current'),
  ]);



  ctx.reply(errorText, keyboard);

}

export { error };




