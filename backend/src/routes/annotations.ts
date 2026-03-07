import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/* =========================
CREATE ANNOTATION
========================= */

router.post("/", async (req, res) => {
  try {
    const { videoId, time, strokes, color } = req.body;

    const annotation = await prisma.annotation.create({
      data: {
        videoId: String(videoId),
        time: Number(time),
        strokes: strokes ?? [],
        color: color ?? "#ff0000",
      },
    });

    res.json(annotation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create annotation" });
  }
});

/* =========================
GET ANNOTATIONS FOR VIDEO
========================= */

router.get("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    const annotations = await prisma.annotation.findMany({
      where: { videoId },
      orderBy: { time: "asc" },
    });

    res.json(annotations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch annotations" });
  }
});

export default router;