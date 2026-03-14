import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/* =========================
CREATE ANNOTATION
========================= */

router.post("/", authMiddleware, async (req, res) => {
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

router.get("/:videoId", authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params as { videoId: string };
    const userId = (req as any).userId;

    // Check ownership
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { project: true },
    }) as any;

    if (!video || video.project.ownerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

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