import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/media/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("data"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ success: false, error: "Error uploading file" });
  }
});

router.delete("/:filename", async (req, res) => {
  const filename = req.params.filename;
  const filePath = `public/media/${filename}`;
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
