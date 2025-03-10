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
const server = express();

const publicPath = express.static(join(__root, "public"));
server.use(cookieParser());
server.use(bodyParser.json({ limit: "10mb" }));
server.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

server.use("/admin", publicPath);
server.use(authEndpoint.prefix, authEndpoint.router);
server.use(usersEndpoint.prefix, usersEndpoint.router);
server.use(settingsEndpoint.prefix, settingsEndpoint.router);
server.use(filesEndpoint.prefix, filesEndpoint.router);
server.use(healthEndpoint.prefix, healthEndpoint.router);
server.get("/admin/*", adminPathHandler);
server.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

server.post(`/bot${TOKEN}`, (req, res) => {
  const update = req.body;
  console.log({ update });
  bot.processUpdate(update);
  res.send();
});

const app = https.createServer(options, server);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
