import { Context } from "telegraf";
import { logger } from "./log";

export function logMiddleware(ctx: Context, next: () => Promise<void>) {
  if ((ctx.message as any)?.text) {
    logger.info(`${ctx.from?.username} (${ctx.from?.id}) in chat ${ctx.chat?.id} said ${(ctx.message as any)?.text}`);
  }

  next();
}
