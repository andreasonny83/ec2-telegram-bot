import { Context } from "telegraf";
import { helpMessage } from "../common";

export async function help(ctx: Context) {
  await ctx.deleteMessage();
  await ctx.reply(helpMessage);
}
