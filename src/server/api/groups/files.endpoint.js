import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  res.end();
});

router.delete("/:filename", async (req, res) => {
  const filename = req.params.filename;
  const filePath = `public/${filename}`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

const files = {
  prefix: "/api/files",
  router,
};

export default files;
