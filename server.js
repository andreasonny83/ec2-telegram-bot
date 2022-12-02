const { Telegraf } = require("telegraf");
const winston = require("winston");

require("dotenv").config();

const myFormat = winston.format.printf(
  ({ _level, message, _label, timestamp }) => {
    return `${timestamp}: ${message}`;
  }
);

const logger = winston.createLogger({
  level: "verbose",
  format: winston.format.combine(winston.format.timestamp(), myFormat),
  transports: [
    new winston.transports.File({
      filename: "debug.log",
      maxsize: 10000000,
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  })
);

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;

// Create a bot
const bot = new Telegraf(token);

const helpMessage = `
Say something to me
/start - start the bot
/help - command reference
/operations - start an operation
`;

bot.use((ctx, next) => {
  if (ctx.message?.text) {
    logger.info(ctx.from.username + " said " + ctx.message.text);
  }

  next();
});

bot.start((ctx) => {
  ctx.reply("Hi, I'm the Trading Bot");
  ctx.reply(helpMessage);
});

bot.help((ctx) => {
  ctx.reply(helpMessage);
});

bot.command("operations", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Please select an operation to perform",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Buy",
              callback_data: "buy",
            },
            {
              text: "Sell",
              callback_data: "sell",
            },
          ],
          [
            {
              text: "Leverage",
              callback_data: "leverage",
            },
            {
              text: "Close",
              callback_data: "close",
            },
          ],
          [
            {
              text: "Position",
              callback_data: "position",
            },
            {
              text: "Done",
              callback_data: "done",
            },
          ],
        ],
      },
    }
  );
});

bot.command("echo", (ctx) => {
  const reply = ctx.message.text.split("/echo")[1];
  ctx.reply(reply);
});

// bot.on("message", (ctx) => {
//   console.warn(ctx);
// });

bot.launch();
