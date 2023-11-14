import { Context, Markup } from 'telegraf';

const error = () => async (ctx: Context) => {
  const errorText = 'Ваш текст замечаний здесь...';

  const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('Создать новый', 'create_new'),
      Markup.button.callback('Выбрать текущий', 'choose_current'),
  ]);

  const additionalButtons = Markup.inlineKeyboard([
    Markup.button.callback('Заявка на производство', 'production_request'),
    Markup.button.callback('Обозначение изделия', 'product_designation'),
    Markup.button.callback('Чертёжный индекс изделия', 'technical_index'),
]);

  ctx.reply(errorText, keyboard);

}

export { error };




