import { Router } from "express";
import multer from "multer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../lib/r2";
import { v4 as uuid } from "uuid";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("video"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const key = `videos/${uuid()}-${file.originalname}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const url = `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;

    res.json({ url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;