import { Context } from "telegraf";
import { getUserId } from "../common";
import { Users } from "../types";

export async function stop(ctx: Context, users: Users) {
  try {
    const userId = getUserId(ctx);

    if (userId && users[userId]) {
      const user = users[userId];
      // user.status = undefined;
      // user.actionId = undefined;
      // user.actionMessageId = undefined;
      // user.symbol = undefined;
      // user.leverage = undefined;
      // user.amount = undefined;
      // user.stop_loss = undefined;
      // user.take_profit = undefined;
    }
  } catch (err) {
    return;
  }
}
