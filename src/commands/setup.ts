import { argsType, ButtonsLabels, PlatformsChooseButtons } from "../types";
import { Context, Keyboard } from "grammy";

type profileType = {
  nickname: string;
  platforms: string[];
  games: string[];
};

export default class Command {
  public static readonly commandName = "setup";

  private userData: profileType = {
    nickname: "",
    platforms: [],
    games: [],
  };

  readonly ChooseButtonsLabels: { [k: string]: string } = {
    ACCEPT: "⚡️ Дальше",
    BACK: "❌ Назад",
  };
  constructor(private args: argsType, private command: Context) {
    this.execute();
  }

  async execute() {
    await this.send(
      "✨ Привет! Вы запустили команду по настройке вашего профиля для поиска напарников :3\n\nДавайте я задам вам пару вопросов что бы понять ваши предпочтения."
    );

    await this.send(
      `${this._getDisplayProfile()} Как вас зовут в Social Club?\n\nЗачем это?: Нужно указать ваш никнейм что бы другим игрокам было легче вас добавлять в друзья и вам не приходилось каждый раз говорить всем свой ник ;3\n\n`
    );

    await this.askNickname();

    if (!this.userData.nickname) return;

    await this.send(
      `${this._getDisplayProfile()} Теперь давайте определимся с платформой(-ами) :3\n\nСейчас у вас на экране появятся кнопки с названиями платформ. Выберите одну или несколько платформ на которых вы играете (только честно!). Когда закончите выбирать, то нажмите "${
        ButtonsLabels.ACCEPT
      }". Если понадобится удалить выбранный вариант, то нажмите на него еще раз ;3`
    );

    await this.askPlatforms();

    if (!this.userData.platforms || !this.userData.platforms[0]) return;

    await this.send(
      `${this._getDisplayProfile()}🧐 Я думаю, что такими темпами вы скоро заведете много друзей. Отлично! Теперь приступим к последнему шагу - выбору игр по которым вы будете искать напарников.`
    );

    await this.askGames();

    if (!this.userData.games || !this.userData.games[0]) return;

    await this.confirm();
  }

  async askNickname() {
    const nickNameMessage = await this._awaitMessage();

    if (!nickNameMessage) {
      this.send("❌ Вы не указали ваш никнейм!");
      return;
    }

    const nickname = nickNameMessage.update.message?.text;

    if (!nickname) {
      this.send("❌ Вы не указали ваш никнейм!");
      return;
    }

    if (nickname.length < 6) {
      this.send(
        "❌ Эй, ваш никнейм слишком короткий! Он должен быть не короче 6-ти символов. Попробуйте еще. /setup"
      );
      return;
    }

    if (nickname.length > 16) {
      this.send(
        "❌ Эй, ваш никнейм слишком длинный! Он не должен быть больше 16-ти символов. Попробуйте еще. /setup"
      );
      return;
    }

    this.userData.nickname = nickname;

    this.send("🔥 Отлично! Вы поставили себе никнейм!");
  }

  private async askPlatforms() {
    await this.command.reply("Укажите ваши платформы:", {
      reply_markup: await this._displayButtons(
        Object.values(PlatformsChooseButtons)
      ),
    });
    const platformsMessage = await this._awaitMessage();

    if (!platformsMessage) {
      this.send("❌ Вы не указали вашу платформу!");
      return;
    }

    const platformName = platformsMessage.update.message!.text;

    const platform = Object.keys(PlatformsChooseButtons).filter(
      (key) => PlatformsChooseButtons[key] === platformName
    )[0];

    if (!platform) {
      this.send("❌ Вы указали несуществующую платформу!");

      return;
    }

    if (platform === "ACCEPT") {
      if (this.userData.platforms.length < 1) {
        this.send(
          "⚠️ Перед тем как продолжить - выберите хотя бы одну платформу!"
        );
        await this.askPlatforms();
        return;
      } else return;
    }

    if (this.userData.platforms.includes(platform)) {
      this.userData.platforms.splice(
        this.userData.platforms.indexOf(platform),
        1
      );

      await this.send(
        `⚠️ Выбранная платформа уже есть в вашем списке! Я ее удалил, но вы можете добавить ее обратно, нажав на "${platformName}" снова.\n\nЕсли надо, то выберите еще одну или несколько платформ.\n\nЕсли вы уже закончили, то нажмите "${PlatformsChooseButtons.ACCEPT}"`
      );

      await this.askPlatforms();
      return;
    }

    this.userData.platforms.push(platform);
    this.send(
      `✅ Вы добавили платформу "${platformName}" в ваш список платформ! Если хотите добавить еще, то выберите еще одну платформу.\n\nЕсли вы закончили, то нажмите "${PlatformsChooseButtons.ACCEPT}"`
    );
    await this.askPlatforms();
  }

  async askGames() {
    await this.command.reply("Укажите ваши игры:", {
      reply_markup: await this._displayButtons(Object.values(ButtonsLabels)),
    });
    const gamesMessage = await this._awaitMessage();

    if (!gamesMessage) {
      this.send("❌ Вы не указали игру!");
      return;
    }

    const gameName = gamesMessage.update.message!.text;

    const game = Object.keys(ButtonsLabels).filter(
      (key) => ButtonsLabels[key] === gameName
    )[0];

    if (!game) {
      this.send("❌ Вы указали несуществующую игру!");

      return;
    }

    if (game === "ACCEPT") {
      if (this.userData.games.length < 1) {
        await this.send(
          "⚠️ Перед тем как продолжить - выберите хотя бы одну игру!"
        );
        await this.askGames();
        return;
      } else return;
    }

    if (this.userData.games.includes(game)) {
      this.userData.games.splice(this.userData.games.indexOf(game), 1);

      await this.send(
        `⚠️ Выбранная игра уже есть в вашем списке! Я ее удалил, но вы можете добавить ее обратно, нажав на "${gameName}" снова.\n\nЕсли надо, то выберите еще одну или несколько игр.\n\nЕсли вы уже закончили, то нажмите "${PlatformsChooseButtons.ACCEPT}"`
      );

      await this.askGames();
      return;
    }

    this.userData.games.push(game);
    await this.send(
      `✅ Вы добавили игру "${gameName}" в ваш список игр! Если хотите добавить еще, то выберите еще одну платформу.\n\nЕсли вы закончили, то нажмите "${ButtonsLabels.ACCEPT}"`
    );
    await this.askGames();
  }

  private async _awaitMessage(): Promise<Context> {
    const messagePromise = new Promise<Context>((resolve) => {
      this.args.EventsHandler.once("message", (message) => {
        message = message!;
        console.log(message.update.message);

        if (message.chat?.id === this.command.chat?.id) resolve(message);
      });
    });

    return messagePromise;
  }

  private async _displayButtons(buttons: string[]) {
    const keyboard = new Keyboard();

    let counter = 1;

    for (let button of buttons) {
      keyboard.text(button);

      counter++;

      if (counter > 3) {
        keyboard.row();
        counter = 1;
      }
    }

    return keyboard;
  }

  private _getDisplayProfile() {
    const displayGamesList = this.userData.games
      .map((game) => ButtonsLabels[game])
      .join(", ");

    const platformsList = this.userData.platforms
      .map((platform) => PlatformsChooseButtons[platform])
      .join(", ");

    const displayProfile = `📝 Ваш никнейм: ${
      this.userData.nickname || "Пусто"
    };\n📌 Ваши игры: ${displayGamesList || "Пусто"};\n💾 Ваши платформы: ${
      platformsList || "Пусто"
    };\n\n`;
    return displayProfile;
  }

  async confirm() {
    this.command.reply(
      `🔥 Огонь! Мне кажется, что ваш профиль будет много кому интересен. Давайте посмотрим что у вас получилось:\n\n${this._getDisplayProfile()}Если вас все устраивает, то нажмите "${
        this.ChooseButtonsLabels.ACCEPT
      }" или "${
        this.ChooseButtonsLabels.BACK
      }" если хотите заполнить профиль заново.`,
      {
        reply_markup: await this._displayButtons(
          Object.values(this.ChooseButtonsLabels)
        ),
      }
    );

    const confirmMessage = await this._awaitMessage();

    if (!confirmMessage) {
      this.send("❌ Вы не ответили нравится ли вам ваш профиль или нет!");
      return;
    }

    const confirm = confirmMessage.update.message?.text;
    const answer = Object.keys(this.ChooseButtonsLabels).filter(
      (key) => this.ChooseButtonsLabels[key] === confirm
    )[0];

    if (!answer) {
      this.send("❌ Вы указали некорректный ответ!");
      return;
    }

    if (answer === "BACK") {
      this.userData.platforms = [];
      this.userData.games = [];
      this.userData = {
        nickname: "",
        platforms: [],
        games: [],
      };

      this.execute();
      return;
    }

    if (answer === "ACCEPT") {
      const { PlayerModel } = this.args.schemes;
      const commandAuthor = await this.command.getAuthor();

      const isExist = await PlayerModel.findOne({
        login: commandAuthor.user.id.toString(),
      });
      console.log(this.userData);

      if (!isExist) {
        PlayerModel.create({
          login: commandAuthor.user.id.toString(),
          ...this.userData,
        });
      } else {
        PlayerModel.updateOne(
          {
            login: commandAuthor.user.id.toString(),
          },
          {
            $set: this.userData,
          }
        );
      }

      this.send(
        "🎉 Юху! Отлично! Вы создали свой профиль! Теперь вы сможете искать напарников в нашем чатике :3"
      );
    }
  }

  send(content: string) {
    if (!content) throw Error("No reply content");
    this.command.reply(content, {
      reply_markup: undefined,
    });
  }
}
