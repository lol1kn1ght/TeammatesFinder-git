import { Bot } from "grammy";
import { readdirSync } from "fs";
import mongoose from "mongoose";
import { token, mongo } from "../config/constants.json";
import * as config from "../config/config.json";
import { argsType, commandType } from "./types";
import * as SchemesList from "./Schemes/List";
import EventsHandler from "./utils/EventsHandler";

class Builder {
  public commands: Map<string, commandType> = new Map<string, commandType>();
  public client = new Bot(token);
  public mongoose = mongoose;

  public args: argsType = {
    mongoose: mongoose,
    client: this.client,
    schemes: SchemesList,
    reloadCommands: this.loadCommands.bind(this),
    reloadEvents: this.loadEvents.bind(this),
    EventsHandler: new EventsHandler(),
    config,
  };

  async launch(): Promise<void> {
    await this.loadCommands();
    await this.loadDb();
    await this.login();
    await this.initEvents();

    this.client.command("start", (ctx) => {});
  }

  async loadCommands(): Promise<void> {
    const commandsDir: string[] = await readdirSync("commands");

    for (let commandFile of commandsDir) {
      if (!commandFile.endsWith(".js")) continue;
      try {
        const Command: commandType =
          require(`./commands/${commandFile}`)?.default;
        if (!Command) continue;
        const commandName = Command.commandName;

        this.commands.set(commandName, Command);
        this.client.command(commandName, (commandData) => {
          new Command(this.args, commandData);
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async loadEvents() {
    const eventsDir = await readdirSync("./events");

    for (let eventFile of eventsDir) {
      if (!eventFile.endsWith(".js")) continue;

      try {
        const eventFunc = require(`./events/${eventFile}`)?.default;

        if (!eventFunc) continue;

        eventFunc(this.args);
      } catch (err) {}
    }
  }

  async loadDb() {
    let { isAuth, user, pass, ip, port, db } = mongo;

    if (isAuth)
      this.mongoose = await this.mongoose.connect(
        `mongodb://${user}:${pass}@${ip}:${port}/${db}`
      );
    else
      this.mongoose = await this.mongoose.connect(
        `mongodb://localhost:27017/telegram`
      );
  }

  async login() {
    this.client.start();
  }

  async initEvents() {
    this.client.on("message", (...args) => {
      this.args.EventsHandler.emit("message", ...args);
    });
  }
}

new Builder().launch();
