import appState from "./mediator/mediator.impl.js";
import bot from "./bot/bot.impl.js";
import scheduler from "./scheduler/scheduler.impl.js";
import { commandHandlers } from "./bot/commands.js";
import { getChatId, callIfAvailable } from "./utils.js";

(async () => {
  await appState.init();

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
      reminder.buttons
        ? {
            reply_markup: {
              keyboard: reminder.buttons,
              one_time_keyboard: true,
              resize_keyboard: true,
            },
          }
        : {}
    );
  });

  // смена сцены
  appState.on("next_scene", async ({ scene, chat_id }) => {
    const reminders = appState.getReminders(chat_id);
    scheduler.plans(chat_id, reminders);
    appState.saveSceneDuration(chat_id);

    switch (scene.name) {
      case "congratulation":
        scheduler.clean();
        await appState.markUserAsCompleted(chat_id);
        break;
      case "gratitude":
        scheduler.plans(chat_id, scene.reminders);
        break;
    }
  });
})();
