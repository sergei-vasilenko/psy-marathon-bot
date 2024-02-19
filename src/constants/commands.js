import bot from "../bot/bot.impl.js";
import appState from "../mediator/mediator.impl.js";
import actionsSignature from "./actions.signature.js";
import { pluralizeWord, callHandlerByKey } from "../utils.js";

export const commands = [
  {
    command: "/logs",
    description: "Получить логи",
    role: "support",
    // handler: async ({ chat_id }) => {
    //   await bot.send(
    //     "text",
    //     chat_id,
    //     "We are looking forward to the implementation"
    //   );
    // },
  },
  {
    command: "/userscount",
    description: "Количество участников марафона (all | active | completed)",
    role: "admin",
    signature: "command_name:cmd type:str",
    handler: async ({ args, chat_id }) => {
      const count = await appState.getUsersCount(args.type);
      const userForm = pluralizeWord(count, [
        "участник",
        "участника",
        "участников",
      ]);

      const message = {
        all: `Всего в марафоне участвовало ${count} ${userForm}.`,
        active: `Сейчас активных: ${count}.`,
        completed: `Завершивших марафон: ${count}.`,
      }[args.type || "all"];

      await bot.send("text", chat_id, message);
    },
  },
  {
    command: "/sendnewsletter",
    description: "Отправить рассылку",
    role: "admin",
    signature: "command_name:cmd text:str",
    handler: async ({ args }) => {
      const chatIdsList = await appState.getUserChatIdsList();
      bot.sendNewsLetter(chatIdsList, args.text);
    },
  },
  {
    command: "/userslist",
    description: "Список участников",
    role: "admin",
    handler: async ({ chat_id }) => {
      const usersList = await appState.getUsersList();
      await bot.sendUsersList(chat_id, usersList);
    },
  },
  {
    command: "/userdetails",
    description: "Список участников",
    role: "admin",
    signature: "command_name:cmd chat_id:int",
    handler: async ({ args, chat_id }) => {
      const user = await appState.getUserDetails(args.chat_id);
      await bot.sendUserDetails(chat_id, user);
    },
  },
  {
    command: "/start",
    description: "Начать марафон",
    role: "user",
    handler: async ({ msg, chat_id }) => {
      const data = await appState.start(msg);
      await appState.markUserAsStartingOver(chat_id);
      await bot.sendStepMessage(chat_id, data);
    },
  },
];

export const commandHandlers = callHandlerByKey(
  commands.map(({ command, handler }) => [command, handler])
);

export const signatures = commands.reduce(
  (result, cmd) => {
    if (cmd.signature) {
      result[cmd.command] = cmd.signature;
    }
    return result;
  },
  { ...actionsSignature }
);
