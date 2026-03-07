import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/* =========================
CREATE COMMENT
========================= */

router.post("/", async (req, res) => {
  try {
    const { videoId, time, text } = req.body as {
      videoId: string;
      time: number;
      text: string;
    };

    const newComment = await prisma.comment.create({
      data: {
        videoId,
        time,
        text,
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

router.get("/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params as { videoId: string };

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