import express from "express";
import dataBase from "../../../database/db.impl.js";
import { DATA_BASES } from "../../../constants.js";

const router = express.Router();
const usersDB = dataBase.connect(DATA_BASES.USERS);

router.get("/list", async (req, res) => {
  const users = await usersDB.list();
  res.status(200).json({ results: users });
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const user = await usersDB.one(id);
  res.status(200).json(user);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await usersDB.delete(id);
  res.status(204).end();
});

const users = {
  prefix: "/api/users",
  router,
};

export default users;
