import appState from "../mediator/mediator.impl.js";
import bot from "./bot.impl.js";
import scheduler from "../scheduler/scheduler.impl.js";
import dataBase from "../database/db.impl.js";
import { commandHandlers } from "../constants/commands.js";
import { getChatId, callIfAvailable, timeToMs } from "../utils.js";
import {
  DATA_BASES,
  SETTINGS_MODELS_ENUM,
  DEFAULT_SETTING_MODELS,
} from "../constants.js";

const settingsDB = dataBase.connect(DATA_BASES.SETTINGS);

(async () => {
  for (const entity of DEFAULT_SETTING_MODELS) {
    await settingsDB.create(entity);
  }

  const { list: aliases } = await settingsDB.one(SETTINGS_MODELS_ENUM.ALIASES);
  const { list: scenario } = await settingsDB.one(
    SETTINGS_MODELS_ENUM.SCENARIO
  );
  let { list: remindersList } = await settingsDB.one(
    SETTINGS_MODELS_ENUM.REMINDERS
  );

  remindersList = remindersList.map((group) => {
    group.reminders = group.reminders.map((item) => ({
      delay: timeToMs(item.delay, item.unit.value),
      message: item.message,
      keyboard: item.keyboard,
    }));
    return group;
  });

  await appState.init(scenario);

  bot.setTextCmdAliases(aliases);

  // обычные сообщения
  bot.on("message", async ({ msg }) => {
    const chatId = getChatId(msg);

    await appState.saveSceneMessage(chatId, msg.text);

    if (appState.isCorrectToNextStep(chatId, msg)) {
      const data = await appState.nextStep(chatId);
      await bot.sendStepMessage(chatId, data);
    }
  });

  // текстовые команды (обычный текст, но замапленный на команды)
  bot.on("text_command", async ({ msg, action_name }) => {
    const chatId = getChatId(msg);

    await callIfAvailable(
      [
        "continue",
        async () => {
          const data = await appState.nextStep(chatId);
          await bot.sendStepMessage(chatId, data);
        },
      ],
      [
        "start_over",
        async () => {
          const data = await appState.start(msg);
          await appState.markUserAsStartingOver(chatId);
          await bot.sendStepMessage(chatId, data);
        },
      ],
      [
        "need_help",
        async () => {
          await bot.requestToHelp({ msg });
        },
      ],
      ["in_process", async () => true]
    )(action_name);
  });

  // сообщения, начинающиеся с символа "@" (подразумевается что это имя бота)
  bot.on("frombot", async ({ args }) => {
    await callIfAvailable([
      "message_to_user",
      async () => {
        await bot.sendHelpMessage(args);
      },
    ])(args.command_name);
  });

  // сообщения, начинающиеся с символа "/"
  bot.on("command", async ({ args, msg }) => {
    const chatId = getChatId(msg);
    await commandHandlers(args.command_name, { args, msg, chat_id: chatId });
  });

  // сообщения с инлайн клавиатуры (значение поля callback_data)
  bot.on("keyboard", async ({ args, msg }) => {
    const chatId = getChatId(msg);

    await callIfAvailable([
      "user_info",
      async () => {
        const user = await appState.getUserDetails(chatId);
        await bot.sendUserDetails(args.chat_id, user);
      },
    ])(args.command_name);
  });

  // отправка сообщения пользователем = его активность
  bot.on("user_activity", async ({ msg }) => {
    const chatId = getChatId(msg);
    await appState.setLastActivityTime(chatId);
  });

  // напоминания из планировщика
  scheduler.on(async ({ id, reminder }) => {
    await bot.send(
      "text",
      id,
      reminder.message,
      reminder.keyboard
        ? {
            reply_markup: {
              keyboard: reminder.keyboard,
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          }
        : {}
    );
  });

  // смена сцены
  appState.on("next_scene", async ({ scene, chat_id }) => {
    const reminders = remindersList.find((elem) => elem.id === scene.reminders);
    scheduler.plans(chat_id, reminders);
    appState.saveSceneDuration(chat_id);

    if (scene.is_last) {
      scheduler.clean();
      await appState.markUserAsCompleted(chat_id);
    }
  });

  appState.on("undefined_behavior", ({ scene, chat_id }) => {
    console.log("undefined_behavior", { scene, chat_id });
  });
})();
