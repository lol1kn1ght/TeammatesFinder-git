import { argsType } from "../types";
import { Context } from "grammy";

export default class Command {
  public static readonly commandName = "start";

  constructor(private args: argsType, private command: Context) {
    this.execute();
  }

  async execute() {
    const { command } = this;

    command.reply(
      `Привет, @${command.from?.username}! Я - бот для поиска игроков по разным играм от сообщества EasyGaming #EZ!`
    );
  }
}
