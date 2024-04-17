import { paths } from "../utils.js";

export default function adminPathHandler(req, res) {
  const { join, __root } = paths(import.meta.url);
  const pathToHtml = join(__root, "public", "index.html");
  console.log("ADMIN", { url: req.url, pathToHtml });
  res.sendFile(pathToHtml);
}
