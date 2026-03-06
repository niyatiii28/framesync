import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/* Create Video */
router.post("/", async (req, res) => {
  try {
    const { title, url, duration, projectId } = req.body;

    const video = await prisma.video.create({
      data: {
        title,
        url,
        duration,
        projectId,
      },
    });

    res.json(video);
  } catch {
    res.status(500).json({ error: "Failed to create video" });
  }
});

/* Get videos for project */
router.get("/:projectId", async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { projectId: req.params.projectId },
    });

    res.json(videos);
  } catch {
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

export default router;