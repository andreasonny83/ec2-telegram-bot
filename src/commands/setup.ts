import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { getChatId, getUserId } from "../common";
import { Users } from "../types";

export async function setApiKey(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    // TEST
    users[userId] = {
      ...users[userId],
      symbols: [],
      apiKey: `${process.env.API_KEY}`,
      apiSecret: `${process.env.API_SECRET}`,
    };

    return;

    // END TEST

    const message = await bot.telegram.sendMessage(chatId, "Please enter your ByBit API key", {
      reply_markup: {
        force_reply: true,
      },
    });

    const actionMessageId = message.message_id;
    const actionId = "set_api_key";

    users[userId] = {
      ...users[userId],
      actionMessageId,
      actionId,
      symbols: [],
    };
  } catch (err) {
    return;
  }
}

export async function setApiSecret(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    const message = await bot.telegram.sendMessage(chatId, "Please enter your ByBit API Secret", {
      reply_markup: {
        force_reply: true,
      },
    });

    const actionMessageId = message.message_id;
    const actionId = "set_api_secret";

    users[userId] = {
      ...users[userId],
      actionMessageId,
      actionId,
    };
  } catch (err) {
    return;
  }
}
