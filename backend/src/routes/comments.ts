import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/* Create Comment */
router.post("/", async (req, res) => {
  try {
    const { videoId, text, time } = req.body;

    const comment = await prisma.comment.create({
      data: {
        videoId,
        text,
        time,
      },
    });

    res.json(comment);
  } catch {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

/* Get comments for video */
router.get("/:videoId", async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { videoId: req.params.videoId },
      orderBy: { time: "asc" },
    });

    res.json(comments);
  } catch {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

export default router;