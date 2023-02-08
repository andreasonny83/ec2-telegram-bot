import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { getChatId, getUserId } from "../common";
import { mainMenu } from "../menus/main";
import { Users } from "../types";
import { setApiKey } from "./setup";

export async function start(bot: Telegraf<Context<Update>>, ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);
    const chatId = await getChatId(ctx);

    if (userId && users[userId]) {
      await bot.telegram.sendMessage(
        chatId,
        "You can perform sell, buy operations or automated trades.\n" +
          "To proceed select an option. Type /stop to restart bot",
        {
          reply_markup: { inline_keyboard: mainMenu },
        }
      );
    } else {
      await ctx.reply("It looks like you haven't configured the trading bot yet.");

      // TEST
      await setApiKey(bot, ctx, users);
      await bot.telegram.sendMessage(
        chatId,
        "You can perform sell, buy operations or automated trades.\n" +
          "To proceed select an option. Type /stop to restart bot",
        {
          reply_markup: { inline_keyboard: mainMenu },
        }
      );

      // END TEST

      return setApiKey(bot, ctx, users);
    }
  } catch (err) {
    return;
  }
}
