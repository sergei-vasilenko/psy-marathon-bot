import TelegramApi from "node-telegram-bot-api";
import EventEmitter from "../eventemitter/eventemitter.impl.js";
import parser from "../parser/parser.impl.js";
import { commands } from "../constants/commands.js";
import { admins } from "../constants/user.groups.js";
import {
  getChatId,
  getConfigKey,
  match,
  millisecondsToTime,
} from "../utils.js";

class Bot {
  #bot = null;
  #ee = null;
  #parser = null;
  #textCmdAliases = new Map();

  constructor(TelegramApi, EventEmitter, parser, commands, getConfigKey) {
    const TOKEN = getConfigKey("TOKEN");

    this.#bot = new TelegramApi(TOKEN);

    this.#bot.setWebHook(this.url);

    this.#ee = new EventEmitter(
      [
        "command",
        "text_command",
        "frombot",
        "message",
        "keyboard",
        "user_activity",
      ],
      "bot"
    );
    this.#parser = parser;
    this.#initCommands(commands);
    this.#initListeners();
  }

  get url() {
    const { TOKEN, URL } = getConfigKey(["TOKEN", "URL"]);
    return `${URL}/bot${TOKEN}`;
  }

  #getMedia(object) {
    return `./media/${object}`;
  }

  #initCommands(commands = []) {
    const indexByRoles = {
      user: 0,
      admin: 1,
      support: 2,
    };
    const roleByIndex = Object.keys(indexByRoles);
    commands
      .reduce(
        (groups, { command, description, role }) => {
          const groupIndex = indexByRoles[role];
          groups[groupIndex].push({ command, description });
          return groups;
        },
        [[], [], []]
      )
      .forEach((commands, index) => {
        const role = roleByIndex[index];

        switch (role) {
          case "user":
            this.#bot.setMyCommands(commands);
            break;
          case "admin":
            for (const adminId of admins) {
              this.#bot.setMyCommands(commands, {
                scope: {
                  type: "chat",
                  chat_id: adminId,
                },
              });
            }
            break;
        }
      });
    return this;
  }

  #initListeners() {
    this.#bot.on("message", (msg) => {
      if (msg.is_bot) {
        return;
      }
      const text = msg.text;
      const messageType = match(
        "message",
        [(text) => text?.startsWith("/"), "command"],
        [(text) => text?.startsWith("@"), "frombot"],
        [(text) => this.#textCmdAliases.has(text), "text_command"]
      )(text);

      this.#ee.emit("user_activity", { msg });
      this.#ee.emit(messageType, {
        msg,
        ...(messageType !== "message" && messageType === "text_command"
          ? {
              action_name: this.#textCmdAliases.get(text),
            }
          : {
              args: this.getArgs(text),
            }),
      });
    });
    this.#bot.on("callback_query", (msg) => {
      if (msg.is_bot) {
        return;
      }
      this.#ee.emit("user_activity", { msg });
      this.#ee.emit("keyboard", { args: this.getArgs(msg.data), msg });
    });
  }

  #concatStrByArray(list = [], handler) {
    return list
      .reduce((res, currentElem) => {
        const prevElem = res.at(-1);
        if (prevElem?.scene > currentElem.scene) {
          res = [currentElem];
        } else {
          res.push(currentElem);
        }
        return res;
      }, [])
      .reduce((str, elem) => handler(str, elem), ``)
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }

  #getStepsDurationText(durations) {
    return (
      `\nВремя на шаги:\n` +
      this.#concatStrByArray(durations, (str, duration) => {
        str += `шаг ${duration.scene} - ${this.#getDurationTime(
          duration.until,
          duration.since
        )}\n`;
        return str;
      })
    );
  }

  #getDurationTime(end, start) {
    const { hours, minutes } = millisecondsToTime(end - start);
    if (!hours) {
      return `${minutes}мин`;
    }
    if (hours && !minutes) {
      return `${hours}ч`;
    }
    return `${hours}ч ${minutes}мин`;
  }

  #getStepsMessageText(messages) {
    return (
      `\nСообщения:\n` +
      this.#concatStrByArray(messages, (str, message) => {
        str += message.text ? `шаг ${message.scene}: ${message.text}\n` : "";
        return str;
      })
    );
  }

  get origin() {
    return this.#bot;
  }

  on(eventname, callback) {
    this.#ee.subscribe(eventname, callback);
  }

  setTextCmdAliases(aliases) {
    const mappedAliases = aliases.map((alias) => [
      alias.name,
      alias.action.value,
    ]);
    this.#textCmdAliases = new Map(mappedAliases);
  }

  getArgs(cmd) {
    return this.#parser.getArgs(cmd);
  }

  processUpdate(data) {
    this.#bot.processUpdate(data);
  }

  async send(type, chatId, data, options = {}) {
    if (!data) {
      return { success: false, message: "'data' field has invalid value" };
    }
    const bot = this.#bot;
    const methods = {
      text: async (chatId, msg, options) => {
        await bot.sendChatAction(chatId, "typing");
        await bot.sendMessage(chatId, msg, options);
      },
      image: async (chatId, filename, options) => {
        await bot.sendChatAction(chatId, "upload_photo");
        await bot.sendPhoto(chatId, this.#getMedia(filename), options);
      },
      audio: async (chatId, filename, options) => {
        await bot.sendChatAction(chatId, "upload_voice");
        await bot.sendAudio(chatId, this.#getMedia(filename), options);
      },
      video: async (chatId, filename, options) => {
        await bot.sendChatAction(chatId, "upload_video");
        await bot.sendVideo(chatId, this.#getMedia(filename), options);
      },
    };
    return await methods[type](chatId, data, options);
  }

  async requestToHelp({ msg }) {
    const chatId = getChatId(msg);

    const { first_name, last_name } = msg.from;
    const text = `Участница ${first_name} ${last_name} попросила о помощи`;

    for (const adminId of admins) {
      await this.send("text", adminId, text, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Дополнительная информация`,
                callback_data: `user_info ${chatId}`,
              },
            ],
            [
              {
                text: `Ответить от своего имени`,
                url: `tg://user?id=${chatId}`,
              },
            ],
            [
              {
                text: `Ответить от имени бота`,
                switch_inline_query_current_chat: `message_to_user ${chatId} `,
              },
            ],
          ],
        },
      });
    }
  }

  async sendHelpMessage(args) {
    const { chat_id, text } = args;
    await this.send("text", chat_id, text);
  }

  async sendStepMessage(id, data) {
    const message = data?.message.filter((elem) => elem.data);
    if (!message || !message.length) return;

    const validFields = ["text", "image", "video"];
    const options = {};

    let count = 0;
    for (const part of message) {
      if (!validFields.includes(part.type)) {
        console.warn(`Field ${part.type} is not valid.`);
        continue;
      }

      const isLast = ++count === message.length;
      if (isLast) {
        options.reply_markup = data.buttons
          ? {
              keyboard: data.buttons,
              one_time_keyboard: true,
              resize_keyboard: true,
              is_persistent: true,
            }
          : { remove_keyboard: true };
      }

      await this.send(part.type, id, part.data, options);
    }
  }

  async sendUsersList(chatId, usersList = []) {
    let message = ``;
    usersList.forEach((user) => {
      if (user) {
        const { _id, first_name, last_name, username } = user;
        message += `\n
        id: ${_id}
        Имя: ${first_name}
        Фамилия: ${last_name}
        ${username ? "@" + username : ""}\n`;
      }
    });

    message = message
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    await this.send("text", chatId, message);
  }

  async sendUserDetails(chatId, user) {
    if (!user) return;
    const {
      _id,
      first_name,
      last_name,
      username,
      scene,
      is_active,
      is_completed,
      course_beginnings,
      date_of_joining,
      last_activity_time,
      scene_message,
      scene_duration,
    } = user;

    let message = `\n
    id: ${_id}
    Имя: ${first_name}
    Фамилия: ${last_name}
    ${username ? "@" + username : ""}

    Присоединился: ${date_of_joining}
    Текущий шаг: ${scene}
    Статус: ${is_active ? "активен" : "не активен"}
    Последняя активность: ${this.#getDurationTime(
      Date.now(),
      last_activity_time
    )} назад
    Пройден ли марафон: ${is_completed ? "да" : "нет"}
    Количество начинаний: ${course_beginnings}`;
    const durations = this.#getStepsDurationText(scene_duration);
    message += durations;

    const sceneMessages = this.#getStepsMessageText(scene_message);
    message += sceneMessages;

    message = message
      .split("\n")
      .map((line) => line.trim())
      .join("\n");

    await this.send("text", chatId, message);
  }

  async sendNewsLetter(userIds = [], text) {
    for (const userId of userIds) {
      await this.send("text", userId, text);
    }
  }
}

const bot = new Bot(TelegramApi, EventEmitter, parser, commands, getConfigKey);

export default bot;
