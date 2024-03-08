import https from "https";
import fs from "fs";
import { getConfigKey } from "../utils.js";
import { routeHandlers } from "./router.js";

const PORT = getConfigKey("PORT");

const options = {
  key: fs.readFileSync("./certificate/key.pem"),
  cert: fs.readFileSync("./certificate/cert.pem"),
  passphrase: getConfigKey("CERT_PHRASE"),
};

const TOKEN = getConfigKey("TOKEN");

const requestHandler = (req, res) => {
  const { url } = req;
  console.log({ url, path: `/${TOKEN}` });
  // routeHandlers(url, req, res);
};

https.createServer(options, requestHandler).listen(PORT, () => {
  console.log("Server is running", { PORT, TOKEN });
});
