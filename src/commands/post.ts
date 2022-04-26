import { argsType, ButtonsLabels, PlatformsChooseButtons } from "../types";
import { Context, Keyboard } from "grammy";
import { PlayerSchemaType } from "../Schemes/Player";

type formType = {
  game: string;
  platform: string;
  nickname: string;
  comment: string;
};

export default class Command {
  public static readonly commandName = "post";

  private readonly cooldownTime = 20;
  private playerData: PlayerSchemaType | null = null;
  private form: formType = {
    game: "",
    nickname: "",
    platform: "",
    comment: "",
  };

  constructor(private args: argsType, private command: Context) {
    this.execute();
  }

  async execute() {
    await this.init();

    if (!this.playerData) {
      this.send(`❌ У вас нет профиля! Создайте его через команду "/setup"`);
      return;
    }
    await this.chooseGames();

    await this.choosePlatforms();

    await this.chooseComment();

    if (!this.form.game || !this.form.platform || !this.form.nickname) {
      this.send(
        "❌ Ваша анкета заполнена неправильно или не полностью и не может быть отправлена."
      );
      return;
    }
    await this.success();
  }

  async init() {
    const { PlayerModel } = this.args.schemes;
    const playerData = await PlayerModel.findOne({
      login: this.command.from?.id,
    });

    this.playerData = playerData;

    this.form.nickname = playerData?.nickname!;
    await this.send(
      "👋 Привет! Вы хотите отправить вашу анкету в наш канал с поиском? Хорошо, я вам помогу.\n\nДля этого нужно пройти пару шагов. Не бойтесь, это не займет много времени."
    );
  }

  async chooseGames() {
    const playerGames = Object.keys(ButtonsLabels)
      .filter((key) => this.playerData?.games.includes(key))
      .map((key) => ButtonsLabels[key]);
    const gamesKeyboard = this.displayKeyboard(playerGames);

    await this.command.reply(
      "🕹 Давайте выберем игру по которой вы будете искать напарника.\n\nЗачем это?: Это нужно чтобы люди могли узнать для какой игры вы ищете напарников и откликнуться на вашу заявку.",
      {
        reply_markup: gamesKeyboard,
      }
    );

    const gameMessage = await this.awaitMessage();

    if (!gameMessage) {
      this.send("❌ Вы не указали игру! Попробуйте заново.");
      return;
    }

    const gameName = gameMessage.update.message?.text;
    const game = Object.keys(ButtonsLabels).filter(
      (key) => ButtonsLabels[key] === gameName
    )[0];

    if (!game) {
      this.send("❌ Вы указали некорректную игру! Попробуйте заново.");
      return;
    }

    this.form.game = game;
    await this.send("✨ Отлично! Вы указали игру. Теперь перейдем дальше.");
  }

  async choosePlatforms() {
    const playerPlatforms = Object.keys(PlatformsChooseButtons)
      .filter((key) => this.playerData?.platforms?.includes(key))
      .map((key) => PlatformsChooseButtons[key]);

    const platformsKeyboard = this.displayKeyboard(playerPlatforms);

    await this.command.reply(
      "🎮 Хорошо, теперь выберем платформу на которой будете играть (можно выбрать одну или несколько).\n\nЗачем это?: Не все игры позволяют играть с разных платформ, поэтому нужно указать платформу.",
      {
        reply_markup: platformsKeyboard,
      }
    );

    const platformMessage = await this.awaitMessage();

    if (!platformMessage) {
      this.send("❌ Вы не указали платформу! Попробуйте заново.");
      return;
    }

    const platformName = platformMessage.update.message?.text;
    const platform = Object.keys(PlatformsChooseButtons).filter(
      (key) => PlatformsChooseButtons[key] === platformName
    )[0];

    if (!platform) {
      this.send("❌ Вы указали некорректную платформу! Попробуйте заново.");
      return;
    }

    this.form.platform = platform;
  }

  async send(content: string) {
    this.command.reply(content, {
      reply_markup: undefined,
    });
  }

  async chooseComment() {
    this.send(
      "✏️ А теперь последний шаг. Укажите комментарий к вашей анкете. Можете написать чем хотите заняться, какие миссии пройти или же требования для участников, которые захотят с вами поиграть."
    );

    const commentMessage = await this.awaitMessage();

    if (!commentMessage) {
      this.send("❌ Вы не указали сообщение с комментарием.");
      return;
    }

    const comment = commentMessage.update.message?.text;

    if (!comment) {
      this.send("❌ Вы не указали сообщение с комментарием.");
      return;
    }

    this.form.comment = comment;
  }

  async success() {
    await this.command.reply(
      `✅ Хорошая работа! Вы закончили заполнение вашей анкеты для поиска игроков. Скоро ваша анкета появится в нашем канале.\n\nИнформация: Отправлять анкету можно раз в ${this.cooldownTime} минут`,
      {
        entities: [
          {
            length: 6,
            offset: 110,
            type: "text_link",
            url: this.args.config.groupURL,
          },
        ],
      }
    );

    this.args.client.api.sendMessage(
      this.args.config.groupID,
      `📢 Кто-то ищет напарников! 📢\n\n📝 Никнейм в SocialClub: ${this.form.nickname}\n💾 Платформа(-ы): ${this.form.platform}\n📌 Игра: ${this.form.game}\n\n❗️ Чтобы оставить свою анкету для для поиска нужно прописать "/setup" в личные сообщения нашему боту @${this.command.me.username}`
    );
  }

  displayKeyboard(buttons: string[]): Keyboard {
    let counter = 1;
    let keyboard = new Keyboard();

    for (let button of buttons) {
      keyboard.text(button);
      counter++;
      if (counter >= 3) {
        counter = 0;
        keyboard.row();
      }
    }

    return keyboard;
  }

  awaitMessage(): Promise<Context> {
    const messagePromise = new Promise<Context>((resolve) => {
      this.args.EventsHandler.once("message", (message) => {
        message = message!;
        console.log(message.update.message?.chat);

        if (message.from?.id === this.command.from?.id) resolve(message);
      });
    });
    return messagePromise;
  }
}
