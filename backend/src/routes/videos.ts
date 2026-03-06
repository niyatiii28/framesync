import { Router } from "express";
import prisma from "../prisma";

const router = Router();

/*
GET videos for a project
GET /videos/project/:projectId
*/
router.get("/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const videos = await prisma.video.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

/*
CREATE video
POST /videos
*/
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create video" });
  }
});

export default router;