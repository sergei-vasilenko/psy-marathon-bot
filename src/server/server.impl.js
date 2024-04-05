import express from "express";
import bodyParser from "body-parser";
import bot from "../bot/bot.impl.js";
import { getEnvKey, paths } from "../utils.js";
import adminPathHandler from "../admin/adminPathHandler.js";
import authEndpoint from "./api/groups/auth.endpoint.js";
import usersEndpoint from "./api/groups/users.endpoint.js";
import settingsEndpoint from "./api/groups/settings.endpoint.js";
import filesEndpoint from "./api/groups/files.endpoint.js";

const { join, __root } = paths(import.meta.url);
const server = express();
const { TOKEN, PORT } = getEnvKey(["TOKEN", "PORT"]);

const publicPath = express.static(join(__root, "public"));
server.use(bodyParser.json());

server.use("/admin", publicPath);
server.use(authEndpoint.prefix, authEndpoint.router);
server.use(usersEndpoint.prefix, usersEndpoint.router);
server.use(settingsEndpoint.prefix, settingsEndpoint.router);
server.use(filesEndpoint.prefix, filesEndpoint.router);
server.get("/admin/*", adminPathHandler);

server.post(`/bot${TOKEN}`, (req, res) => {
  const update = req.body;
  bot.processUpdate(update);
  res.send();
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// const options = {
//   key: fs.readFileSync("./certificate/key.pem"),
//   cert: fs.readFileSync("./certificate/cert.pem"),
//   passphrase: getConfigKey("CERT_PHRASE"),
// };
