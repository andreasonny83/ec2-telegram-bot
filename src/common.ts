import { Context } from "telegraf";
import { createHmac } from "crypto";

export const helpMessage = `
Hi, I'm the Trading Bot. Say something to me:
/start - start the bot
/setup - setup user's credentials (API Key and Secret)
/help - command reference
`;

export function getUserId(ctx: Context) {
  const userId = ctx.from?.id;

  if (!userId) {
    const errorMessage = "Error. Cannot retrieve your user ID. Please, try again later";
    ctx.reply(errorMessage);
    throw Error(errorMessage);
  }

  return userId;
}

export async function getChatId(ctx: Context) {
  const chatId = ctx.chat?.id;

  if (!chatId) {
    const errorMessage = "Error. Cannot retrieve any Chat ID. Please, try again later";
    await ctx.reply(errorMessage);
    throw Error(errorMessage);
  }

  return chatId;
}

export function getUTC() {
  return Math.floor(Date.now());
}

export async function signMessage(message: string, secret: string): Promise<string> {
  return createHmac("sha256", secret).update(message).digest("hex");
}
