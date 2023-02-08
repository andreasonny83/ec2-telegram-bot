import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { getChatId, getUserId } from "../common";
import { Users } from "../types";

export async function setTradeAmount(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    const message = await bot.telegram.sendMessage(
      chatId,
      "Enter quantity. A number between zero(0) and 100. " + "It will be passed as a percentage of your asset balance",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    const actionMessageId = message.message_id;
    const actionId = "set_trade_amount";

    users[userId] = {
      ...users[userId],
      actionMessageId,
      actionId,
    };
  } catch (err) {
    return;
  }
}

export async function setTradeLeverage(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    const message = await bot.telegram.sendMessage(
      chatId,
      "Enter your Leverage Data. A number between zero(0) and 100. " + "It will be passed as a percentage",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    const actionMessageId = message.message_id;
    const actionId = "set_leverage_data";

    users[userId] = {
      ...users[userId],
      actionMessageId,
      actionId,
    };
  } catch (err) {
    return;
  }
}

export async function setTradeStopLoss(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    const message = await bot.telegram.sendMessage(
      chatId,
      "Enter your Stop Loss Data. A number between zero(0) and 100. " + "It will be passed as a percentage",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    const actionMessageId = message.message_id;
    const actionId = "set_stop_loss";

    users[userId] = {
      ...users[userId],
      actionMessageId,
      actionId,
    };
  } catch (err) {
    return;
  }
}

export async function setTradeTakeProfit(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    const message = await bot.telegram.sendMessage(
      chatId,
      "Enter your Take Profit Data. A number between zero(0) and 100. " + "It will be passed as a percentage",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    );

    const actionMessageId = message.message_id;
    const actionId = "set_take_profit";

    users[userId] = {
      ...users[userId],
      actionMessageId,
      actionId,
    };
  } catch (err) {
    return;
  }
}
