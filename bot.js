const express = require('express');
const { Grammy, Router, Extra } = require('grammy');

const app = express();
const router = new Router();
const bot = new Grammy(process.env.BOT_TOKEN);

// Define the command and the keyboard
router.command('start', (ctx) => {
  ctx.reply('Welcome to my bot!', Extra.markup((markup) => {
    return markup.keyboard([
      ['Item 1', 'Item 2'],
      ['Item 3']
    ]).oneTime().resize();
  }));
});

// Handle when a keyboard item is clicked
router.on('message', (ctx) => {
  const message = ctx.message.text;
  if (message === 'Item 1') {
    ctx.reply('You clicked Item 1!');
  } else if (message === 'Item 2') {
    ctx.reply('You clicked Item 2!');
  } else if (message === 'Item 3') {
    ctx.reply('You clicked Item 3!');
  }
});

bot.use(router);

// Start the bot
bot.start();

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
