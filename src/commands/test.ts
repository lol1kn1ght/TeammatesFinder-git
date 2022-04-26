import { argsType } from "../types";
import { Context } from "grammy";

export default class Command {
  public static readonly commandName = "test";

  constructor(private args: argsType, private command: Context) {
    this.execute();
  }

  async execute() {
    const { PlayerModel } = this.args.schemes;

    console.log(await PlayerModel.find());
  }
}
