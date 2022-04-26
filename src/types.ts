import { PlayerModel } from "./Schemes/Player";
import { Bot, Context } from "grammy";
import Mongoose from "mongoose";
import EventsHandler from "./utils/EventsHandler";

export type commandArgs = {};

export interface commandType {
  readonly commandName: string;
  new (args: argsType, ctx: Context): void;

  execute(): Promise<void>;
}

export type configType = {
  groupURL: string;
  groupID: number;
};

export type argsType = {
  mongoose: typeof Mongoose;
  client: Bot;
  schemes: {
    PlayerModel: typeof PlayerModel;
  };
  reloadCommands: () => Promise<void>;
  reloadEvents: () => Promise<void>;
  EventsHandler: EventsHandler;
  config: configType;
};

export const ButtonsLabels: Readonly<{ [k: string]: string }> = {
  GTAV: "🚓 GTA Online",
  RS6: "🌈 Rainbow 6 Siege",
  CSGO: "🔫 CSGO",
  ACCEPT: "✅ Подтвердить",
};

export const PlatformsChooseButtons: Readonly<{ [k: string]: string }> = {
  PC: "💻 PC",
  PS: "🎮 PS",
  XBOX: "🕹 XBOX",
  ACCEPT: "⚡️ Дальше",
};
