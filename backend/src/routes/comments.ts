import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

/* =========================
CREATE COMMENT
========================= */

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { videoId, time, text, x, y } = req.body as {
      videoId: string;
      time: number;
      text: string;
      x?: number;
      y?: number;
    };

    const newComment = await prisma.comment.create({
      data: {
        videoId,
        time,
        text,
        x: x ?? null,
        y: y ?? null,
      },
    });

    res.json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

/* =========================
GET COMMENTS FOR VIDEO
========================= */

router.get("/:videoId", authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params as { videoId: string };
    const userId = (req as any).userId;

    // Check ownership via video -> project
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { project: true },
    });

    if (!video || video.project.ownerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const comments = await prisma.comment.findMany({
      where: { videoId },
      orderBy: { time: "asc" },
    });

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

export default router;