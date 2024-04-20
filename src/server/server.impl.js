import https from "https";
import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import bot from "../bot/bot.impl.js";
import { getEnvKey, paths, getConfigKey } from "../utils.js";
import adminPathHandler from "../admin/adminPathHandler.js";
import authEndpoint from "./api/groups/auth.endpoint.js";
import usersEndpoint from "./api/groups/users.endpoint.js";
import settingsEndpoint from "./api/groups/settings.endpoint.js";
import filesEndpoint from "./api/groups/files.endpoint.js";
import healthEndpoint from "./api/groups/health.endpoint.js";

const { join, __root } = paths(import.meta.url);
const { TOKEN, PORT } = getEnvKey(["TOKEN", "PORT"]);

const options = {
  key: fs.readFileSync("./certificate/key.pem"),
  cert: fs.readFileSync("./certificate/cert.pem"),
  passphrase: getConfigKey("CERT_PHRASE"),
};
const botServer = express();

botServer.post(`/bot${TOKEN}`, (req, res) => {
  const update = req.body;
  bot.processUpdate(update);
  res.send();
});

const botApp = https.createServer(options, botServer);
botApp.listen(PORT, () => {
  console.log(`Bot is listening on port ${PORT}`);
});

const adminPanel = express();
const publicPath = express.static(join(__root, "public"));
adminPanel.use(cookieParser());
adminPanel.use(bodyParser.json({ limit: "10mb" }));
adminPanel.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

adminPanel.use("/admin", publicPath);
adminPanel.use(authEndpoint.prefix, authEndpoint.router);
adminPanel.use(usersEndpoint.prefix, usersEndpoint.router);
adminPanel.use(settingsEndpoint.prefix, settingsEndpoint.router);
adminPanel.use(filesEndpoint.prefix, filesEndpoint.router);
adminPanel.use(healthEndpoint.prefix, healthEndpoint.router);
adminPanel.get("/admin/*", adminPathHandler);
adminPanel.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

const adminPanelApp = https.createServer(options, adminPanel);
adminPanelApp.listen(443, () => {
  console.log(`Server is listening on port 443`);
});
