import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/* Save annotation */
router.post("/", async (req, res) => {
  try {
    const { videoId, time, strokes, color } = req.body;

    const annotation = await prisma.annotation.create({
      data: {
        videoId,
        time,
        strokes,
        color,
      },
    });

    res.json(annotation);
  } catch {
    res.status(500).json({ error: "Failed to save annotation" });
  }
});

/* Load annotations */
router.get("/:videoId", async (req, res) => {
  try {
    const annotations = await prisma.annotation.findMany({
      where: { videoId: req.params.videoId },
    });

    res.json(annotations);
  } catch {
    res.status(500).json({ error: "Failed to load annotations" });
  }
});

export default router;