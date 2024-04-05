import "./server/server.impl.js";
import "./bot/bot.init.js";
import { DATA_BASES, DEFAULT_SETTING_MODELS } from "./constants.js";
import dataBase from "./database/db.impl.js";

const settingsDB = dataBase.connect(DATA_BASES.SETTINGS);

(async () => {
  for (const entity of DEFAULT_SETTING_MODELS) {
    await settingsDB.create(entity);
  }
})();
