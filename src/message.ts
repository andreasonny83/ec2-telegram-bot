import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { setApiSecret } from "./commands/setup";
import { setTradeLeverage, setTradeStopLoss, setTradeTakeProfit } from "./commands/trade";
import { getChatId, getUserId } from "./common";
import { mainMenu } from "./menus/main";
import { operations } from "./menus/operations";
import { Users } from "./types";
import { InverseClient } from "bybit-api";

export const message = (bot: Telegraf<Context<Update>>, users: Users) => async (ctx: Context) => {
  const userId = getUserId(ctx);
  const messageId = (ctx.message as any)?.reply_to_message?.message_id;

  if (!(messageId && userId)) {
    return;
  }

  const actionId = users[userId].actionId;
  const actionMessageId = users[userId].actionMessageId;
  const message = (ctx.message as any)?.text;
  const chatId = await getChatId(ctx);

  if (messageId !== actionMessageId) {
    return;
  }

  users[userId].actionMessageId = undefined;

  if (actionId === "set_api_key") {
    try {
      ctx.deleteMessage();
      users[userId].apiKey = message;
      await ctx.reply("Success: Your API Key has been recorded");
      return setApiSecret(bot, ctx, users);
    } catch (err) {
      console.log("Error while storing user's API Key", err);
      await ctx.reply("Error: Something went wrong. Please try again later");
    }
  }
  if (actionId === "set_api_secret") {
    try {
      ctx.deleteMessage();
      // users[userId].apiSecret = message;
      await ctx.reply("Success: Your API Secret has been recorded");

      await bot.telegram.sendMessage(
        chatId,
        "You can perform sell, buy operations or automated trades.\n" +
          "To proceed select an option. Type /stop to restart bot",
        {
          reply_markup: { inline_keyboard: mainMenu },
        }
      );
    } catch (err) {
      console.log("Error while storing user's API secret", err);
      await ctx.reply("Error: Something went wrong. Please try again later");
    }
  }
  if (actionId === "set_trade_amount") {
    try {
      ctx.deleteMessage();
      const symbolId = users[userId].actionPayload.symbolId;
      const userSymbol = users[userId].symbols.find((symbol) => symbol.symbolId === symbolId);
      if (!userSymbol) {
        throw Error("Missing user's symbol");
      }

      userSymbol.amount = Number(message);
      return setTradeLeverage(bot, ctx, users);
    } catch (err) {
      console.log("Error while storing user's trade amount", err);
      await ctx.reply("Error: Something went wrong. Please try again later");
    }
  }
  if (actionId === "set_leverage_data") {
    const key = users[userId].apiKey;
    const secret = users[userId].apiSecret;
    const TOKEN = `${process.env.TOKEN}`;
    const API_URL = `${process.env.API_URL}`;
    const TESTNET = Boolean(`${process.env.TESTNET}`);

    const client = new InverseClient({
      key,
      secret,
      testnet: TESTNET,
      baseUrl: API_URL,
      strict_param_validation: true,
      enable_time_sync: true,
    });

    try {
      ctx.deleteMessage();
      const symbolId = users[userId].actionPayload.symbolId;
      const userSymbol = users[userId].symbols.find((symbol) => symbol.symbolId === symbolId);
      if (!userSymbol) {
        throw Error("Missing use symbol");
      }

      userSymbol.leverage = Number(message);

      await client.setUserLeverage({
        leverage: Number(message),
        symbol: symbolId,
      });

      return setTradeStopLoss(bot, ctx, users);
    } catch (err) {
      console.log("Error while storing user's trade amount", err);
      await ctx.reply("Error: Something went wrong. Please try again later");
    }
  }

  if (actionId === "set_stop_loss") {
    try {
      ctx.deleteMessage();
      const symbolId = users[userId].actionPayload.symbolId;
      const userSymbol = users[userId].symbols.find((symbol) => symbol.symbolId === symbolId);
      if (!userSymbol) {
        throw Error("Missing use symbol");
      }

      userSymbol.stop_loss = Number(message);
      return setTradeTakeProfit(bot, ctx, users);
    } catch (err) {
      console.log("Error while storing user's stop loss amount", err);
      await ctx.reply("Error: Something went wrong. Please try again later");
    }
  }
  if (actionId === "set_take_profit") {
    try {
      ctx.deleteMessage();
      const symbolId = users[userId].actionPayload.symbolId;
      const userSymbol = users[userId].symbols.find((symbol) => symbol.symbolId === symbolId);
      if (!userSymbol) {
        throw Error("Missing use symbol");
      }

      userSymbol.take_profit = Number(message);
      users[userId].status = "ready";
      return bot.telegram.sendMessage(chatId, "Please select an operation to perform", {
        reply_markup: { inline_keyboard: operations },
      });
    } catch (err) {
      console.log("Error while storing user's take profit amount", err);
      await ctx.reply("Error: Something went wrong. Please try again later");
    }
  }
};
