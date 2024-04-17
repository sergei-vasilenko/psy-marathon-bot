import express from "express";
import { getEnvKey } from "../../../utils.js";
import apiErrors from "../api.errors.js";
import sessions from "../../../session/sessions.impl.js";

const router = express.Router();
const { LOGIN, PASSWORD } = getEnvKey(["LOGIN", "PASSWORD"]);

router.get("/status", async (req, res) => {
  await sessions.restore();
  const is_auth = sessions.isAuth(req);
  res.status(200).json({ is_auth });
});

router.post("/login", async (req, res) => {
  const { login, password } = req.body;
  const loginErrMessage = login !== LOGIN ? "User not found" : "";
  const passwordErrMessage = password !== PASSWORD ? "Password is wrong" : "";
  if (loginErrMessage || passwordErrMessage) {
    res.status(401).json({
      error_code: apiErrors[401],
      message: {
        ...(loginErrMessage && { login: loginErrMessage }),
        ...(passwordErrMessage && { password: passwordErrMessage }),
      },
    });
    return;
  }
  await sessions.start(req, res);
  res.status(200).end();
});

router.post("/logout", async (req, res) => {
  await sessions.end(req, res);
  res.status(200).end();
});

const auth = {
  prefix: "/api/auth",
  router,
};

export default auth;
