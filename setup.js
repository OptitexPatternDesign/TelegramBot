const express = require('express');
const { Grammy } = require('grammy');

// Create a new instance of Express.js
const app = express();
// Set the port number
const port = 3000;

// Create a new instance of the Grammy library
const bot = new Grammy(process.env.BOT_TOKEN);

// Start the bot
bot.start();

// Handle the /start command
bot.command('start', ctx => {
  ctx.reply('Hello, welcome to my bot!');
});

// Create a non-inline keyboard with two buttons
const keyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Button 1' }],
      [{ text: 'Button 2' }],
    ],
  },
};

// Handle the /keyboard command
bot.command('keyboard', ctx => {
  ctx.reply('Here is your keyboard:', keyboard);
});

// Handle a button click event
bot.on('text', ctx => {
  const message = ctx.message.text;
  if (message === 'Button 1') {
    // Show a message when Button 1 is clicked
    ctx.reply('You clicked Button 1!');
  } else if (message === 'Button 2') {
    // Show a message when Button 2 is clicked
    ctx.reply('You clicked Button 2!');
  }
});

// Start the Express.js server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});