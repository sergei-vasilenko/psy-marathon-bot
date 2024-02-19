import bot from "../bot/bot.impl.js";
import { getConfigKey, callHandlerByKey } from "../utils.js";

const TOKEN = getConfigKey("TOKEN");

const routes = {
  [`/${TOKEN}`]: (req, res) => {
    if (req.method !== "POST") {
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const update = JSON.parse(body);
      bot.processUpdate(update);
      res.writeHead(200);
      res.end();
    });
  },
  admin: () => {},
};

export const routeHandlers = callHandlerByKey(
  Object.entries(routes),
  (req, res) => {
    res.writeHead(404);
    res.end();
  }
);
