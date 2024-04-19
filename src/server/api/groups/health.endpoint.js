import express from "express";

const router = express.Router();

router.get("/check", async (req, res) => {
  res.status(200).end();
});

const health = {
  prefix: "/api/health",
  router,
};

export default health;
