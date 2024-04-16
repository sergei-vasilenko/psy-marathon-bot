import express from "express";
import dataBase from "../../../database/db.impl.js";
import bot from "../../../bot/bot.impl.js";
import scenes from "../../../scenes/scenemanager.impl.js";
import { DATA_BASES } from "../../../constants.js";

const router = express.Router();
const settingsDB = dataBase.connect(DATA_BASES.SETTINGS);

router.get("/scenario", async (req, res) => {
  const { list } = await settingsDB.one("scenario");
  res.status(200).json(list);
});

router.post("/scenario", (req, res) => {
  const { body } = req;
  settingsDB.set({ _id: "scenario", list: body });
  scenes.init(body);
  res.status(204).end();
});

router.delete("/scenario", (req, res) => {
  settingsDB.set({ _id: "scenario", list: [] });
  res.status(204).end();
});

router.get("/aliases", async (req, res) => {
  const result = await settingsDB.one("aliases");
  res.status(200).json(result);
});

router.post("/aliases", async (req, res) => {
  const {
    body: { next_id, list },
  } = req;
  await settingsDB.set({ _id: "aliases", next_id, list });
  bot.setTextCmdAliases(list);
  res.status(204).end();
});

router.delete("/aliases", async (req, res) => {
  await settingsDB.delete("aliases");
  res.status(204).end();
});

router.get("/reminders", async (req, res) => {
  const isPreview = req.query.preview;
  const { list } = await settingsDB.one("reminders");
  const data = isPreview
    ? list.map((elem) => ({ id: elem.id, title: elem.name }))
    : list;
  res.status(200).json(data);
});

router.post("/reminders", async (req, res) => {
  const { body } = req;
  await settingsDB.set({ _id: "reminders", list: body });
  res.status(204).end();
});

router.delete("/reminders", async (req, res) => {
  await settingsDB.delete("reminders");
  res.status(204).end();
});

const scenario = {
  prefix: "/api/settings",
  router,
};

export default scenario;
