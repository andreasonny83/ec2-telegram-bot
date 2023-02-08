import { Context, Telegraf } from "telegraf";
import dotenv from "dotenv";
import { InverseClient } from "bybit-api";

import { logger } from "./log";
import { help } from "./commands/help";
import { getChatId, getUserId, helpMessage } from "./common";
import { mainMenu } from "./menus/main";
import { Users } from "./types";
import { logMiddleware } from "./middleware";
import { start } from "./commands/start";
import { stop } from "./commands/stop";
import { setApiKey } from "./commands/setup";
import { message } from "./message";
import { operations } from "./menus/operations";
import { setTradeAmount } from "./commands/trade";

dotenv.config();
let users: Users = {};

// replace the value below with the Telegram token you receive from @BotFather
const TOKEN = `${process.env.TOKEN}`;
const API_URL = `${process.env.API_URL}`;
const TESTNET = Boolean(`${process.env.TESTNET}`);

// Create a bot
const bot = new Telegraf(TOKEN);
bot.use(logMiddleware);
bot.help(help);

bot.start(async (ctx: Context) => {
  await ctx.reply("Hi, I'm the Trading Bot.");
  await start(bot, ctx, users);
});

bot.command("start", async (ctx: Context) => {
  await ctx.deleteMessage();
  await ctx.reply(helpMessage);
  await start(bot, ctx, users);
});

bot.action("start", async (ctx: Context) => {
  await ctx.deleteMessage();
  await ctx.reply(helpMessage);
  await start(bot, ctx, users);
});

bot.action("done", async (ctx: Context) => {
  await ctx.deleteMessage();
  await start(bot, ctx, users);
});

bot.command("stop", async (ctx: Context) => {
  await stop(ctx, users);
  await ctx.reply("Trading bot stopped. To start again, type /start");
});

bot.command("setup", async (ctx: Context) => {
  await ctx.deleteMessage();
  await setApiKey(bot, ctx, users);
});

bot.action("main", async (ctx: Context) => {
  await ctx.deleteMessage();
  try {
    const chatId = await getChatId(ctx);

    await bot.telegram.sendMessage(
      chatId,
      "You can perform sell, buy operations or automated trades.\n" +
        "To proceed select an option. Type /stop to restart bot",
      {
        reply_markup: { inline_keyboard: mainMenu },
      }
    );
  } catch (err) {
    return;
  }
});

bot.action("settings", async (ctx: Context) => {
  try {
    const userId = getUserId(ctx);
    const user = users[userId];
    const symbolId = user.selected_symbol;

    users[userId].actionPayload = { symbolId };

    console.warn(JSON.stringify(users));

    await setTradeAmount(bot, ctx, users);
  } catch (err) {
    return;
  }
});

bot.action("trade_eth", async (ctx: Context) => {
  const SYMBOL_ID = "ETHUSD";
  const WALLET_ID = "ETH";

  try {
    await ctx.deleteMessage();
    const chatId = await getChatId(ctx);
    const userId = getUserId(ctx);
    const user = users[userId];
    const userSymbol = user.symbols.find((symbol) => symbol.symbolId === SYMBOL_ID);
    user.selected_symbol = SYMBOL_ID;

    if (user.status === "ready" && userSymbol) {
      bot.telegram.sendMessage(chatId, "Please select an operation to perform", {
        reply_markup: { inline_keyboard: operations },
      });
    } else {
      user.symbols.push({
        symbolId: SYMBOL_ID,
        walletId: WALLET_ID,
      });
      users[userId].actionPayload = {
        symbolId: SYMBOL_ID,
      };
      await setTradeAmount(bot, ctx, users);
    }
  } catch (err) {
    return;
  }
});

bot.action("trade_btc", async (ctx: Context) => {
  const SYMBOL_ID = "BTCUSD";
  const WALLET_ID = "BTC";

  try {
    await ctx.deleteMessage();
    const chatId = await getChatId(ctx);
    const userId = getUserId(ctx);
    const user = users[userId];
    const userSymbol = user.symbols.find((symbol) => symbol.symbolId === SYMBOL_ID);
    user.selected_symbol = SYMBOL_ID;

    if (user.status === "ready" && userSymbol) {
      bot.telegram.sendMessage(chatId, "Please select an operation to perform", {
        reply_markup: { inline_keyboard: operations },
      });
    } else {
      user.symbols.push({
        symbolId: SYMBOL_ID,
        walletId: WALLET_ID,
      });
      users[userId].actionPayload = {
        symbolId: SYMBOL_ID,
      };
      await setTradeAmount(bot, ctx, users);
    }
  } catch (err) {
    return;
  }
});

bot.action("long", async (ctx: Context) => {
  try {
    const userId = await getUserId(ctx);
    const user = users[userId];
    const key = user.apiKey;
    const secret = user.apiSecret;
    const symbolId = user.selected_symbol;
    const userSymbol = user.symbols.find((symbol) => symbol.symbolId === symbolId);
    const coinId = `${userSymbol?.walletId}`;

    const client = new InverseClient({
      key,
      secret,
      testnet: TESTNET,
      baseUrl: API_URL,
      strict_param_validation: true,
      enable_time_sync: true,
    });

    const tickers = client.getTickers({
      symbol: userSymbol?.symbolId,
    });
    const walletBalance = client.getWalletBalance({
      coin: coinId,
    });

    const [tickersRes, walletBalanceRes] = await Promise.all([tickers, walletBalance]);

    if (tickersRes.ret_msg !== "OK") {
      throw new Error("Cannot retrieve tickers");
    }

    const markPrice = tickersRes.result[0].mark_price;

    if (walletBalanceRes.ret_msg !== "OK") {
      throw new Error("Cannot retrieve wallet balance");
    }

    const availableBalance = walletBalanceRes.result[coinId].available_balance;
    const qty = availableBalance * markPrice * (Number(userSymbol?.amount) / 100) * Number(userSymbol?.leverage);
    const takeProfit = markPrice * (1 + Number(userSymbol?.take_profit) / 100);
    const stopLoss = markPrice * (1 - Number(userSymbol?.stop_loss) / 100);

    // const response = await client.postPrivate("v2/private/order/create", {
    const response = await client.placeActiveOrder({
      time_in_force: "PostOnly",
      category: "linear",
      side: "Buy",
      order_type: "Market",
      symbol: `${userSymbol?.symbolId}`,
      qty: Number(qty),
      take_profit: takeProfit.toFixed(2), // TODO: Decimals are ignored by ByBit
      stop_loss: stopLoss.toFixed(2), // TODO: Decimals are ignored by ByBit
    } as any);

    logger.info("response from Long operation");
    logger.info(JSON.stringify(response));

    if (response.ret_msg === "OK") {
      await ctx.reply(response.ret_msg);
      await ctx.reply(`Long order ID created: ${response.result.order_id}`);
    } else {
      await ctx.reply(response.ret_msg);
    }
  } catch (err) {
    return;
  }
});

bot.action("short", async (ctx: Context) => {
  try {
    const userId = await getUserId(ctx);
    const user = users[userId];
    const key = user.apiKey;
    const secret = user.apiSecret;
    const symbolId = user.selected_symbol;
    const userSymbol = user.symbols.find((symbol) => symbol.symbolId === symbolId);
    const coinId = `${userSymbol?.walletId}`;

    const client = new InverseClient({
      key,
      secret,
      testnet: TESTNET,
      baseUrl: API_URL,
      strict_param_validation: true,
      enable_time_sync: true,
    });

    const tickers = client.getTickers({
      symbol: userSymbol?.symbolId,
    });
    const walletBalance = client.getWalletBalance({
      coin: coinId,
    });

    const [tickersRes, walletBalanceRes] = await Promise.all([tickers, walletBalance]);

    if (tickersRes.ret_msg !== "OK") {
      throw new Error("Cannot retrieve tickers");
    }

    const markPrice = tickersRes.result[0].mark_price;

    if (walletBalanceRes.ret_msg !== "OK") {
      throw new Error("Cannot retrieve wallet balance");
    }

    const availableBalance = walletBalanceRes.result[coinId].available_balance;
    const qty = availableBalance * markPrice * (Number(userSymbol?.amount) / 100) * Number(userSymbol?.leverage);
    const stopLoss = markPrice * (1 + Number(userSymbol?.take_profit) / 100);
    const takeProfit = markPrice * (1 - Number(userSymbol?.stop_loss) / 100);

    const response = await client.placeActiveOrder({
      time_in_force: "PostOnly",
      category: "linear",
      side: "Sell",
      order_type: "Market",
      symbol: `${userSymbol?.symbolId}`,
      qty: Number(qty),
      take_profit: takeProfit.toFixed(2), // TODO: Decimals are ignored by ByBit
      stop_loss: stopLoss.toFixed(2), // TODO: Decimals are ignored by ByBit
    } as any);

    logger.info("response from Sell operation");
    logger.info(JSON.stringify(response));

    if (response.ret_msg === "OK") {
      await ctx.reply(response.ret_msg);
      await ctx.reply(`Short order ID created: ${response.result.order_id}`);
    } else {
      await ctx.reply(response.ret_msg);
    }
  } catch (err) {
    return;
  }
});

bot.action("getPosition", async (ctx: Context) => {
  try {
    const userId = await getUserId(ctx);
    const user = users[userId];
    const key = user.apiKey;
    const secret = user.apiSecret;
    const symbolId = user.selected_symbol;
    const userSymbol = user.symbols.find((symbol) => symbol.symbolId === symbolId);

    const client = new InverseClient({
      key,
      secret,
      testnet: TESTNET,
      baseUrl: API_URL,
      strict_param_validation: true,
      enable_time_sync: true,
    });

    const posInfo = await client.getPosition({
      symbol: symbolId,
    });

    if (posInfo.ret_msg !== "OK") {
      throw new Error("Cannot retrieve position info");
    }

    logger.info("response from get Position operation");
    logger.info(JSON.stringify(posInfo));

    if (posInfo.ret_msg === "OK") {
      await ctx.reply(posInfo.ret_msg);
      await ctx.reply(`Position info: ${posInfo.result.order_id}`);
    } else {
      await ctx.reply(posInfo.ret_msg);
    }
  } catch (err) {
    return;
  }
});

bot.action("closeTrade", async (ctx: Context) => {
  try {
    const userId = await getUserId(ctx);
    const user = users[userId];
    const key = user.apiKey;
    const secret = user.apiSecret;
    const symbolId = user.selected_symbol;
    const userSymbol = user.symbols.find((symbol) => symbol.symbolId === symbolId);

    const client = new InverseClient({
      key,
      secret,
      testnet: TESTNET,
      baseUrl: API_URL,
      strict_param_validation: true,
      enable_time_sync: true,
    });

    const posInfo = await client.getPosition({
      symbol: symbolId,
    });

    if (posInfo.ret_msg !== "OK") {
      throw new Error("Cannot retrieve position info");
    }

    const positionSize = posInfo.result.size;
    const positionSide = posInfo.result.side;
    const newPosSide = positionSide === "Buy" ? "Sell" : "Buy";

    const response = await client.placeActiveOrder({
      time_in_force: "PostOnly",
      category: "linear",
      side: newPosSide,
      order_type: "Market",
      symbol: `${userSymbol?.symbolId}`,
      qty: Number(positionSize),
    } as any);

    logger.info("response from Stop operation");
    logger.info(JSON.stringify(response));

    if (response.ret_msg === "OK") {
      await ctx.reply(response.ret_msg);
      await ctx.reply(`Order ID created: ${response.result.order_id}`);
    } else {
      await ctx.reply(response.ret_msg);
    }
  } catch (err) {
    return;
  }
});

bot.on("message", message(bot, users));

bot.launch();
