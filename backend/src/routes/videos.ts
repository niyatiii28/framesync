import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../lib/r2";

const router = Router();

async function getPresignedVideoUrl(videoUrl: string) {
  if (!videoUrl) return videoUrl;

  if (videoUrl.includes(".r2.cloudflarestorage.com")) {
    try {
      const urlObj = new URL(videoUrl);
      const key = urlObj.pathname.slice(1);

      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(r2, command, { expiresIn: 3600 });
    } catch (e) {
      console.error("Failed to generate presigned URL", e);
      return videoUrl;
    }
  }

  return videoUrl;
}

/*
GET videos for a project
GET /videos/project/:projectId
*/
router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params as { projectId: string };
    const userId = (req as any).userId;

    // Allow access if owner OR invited member
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
    });

    if (!project) {
      return res.status(403).json({ error: "Access denied" });
    }

    const videos = await prisma.video.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    const signedVideos = await Promise.all(
      videos.map(async (v) => ({
        ...v,
        url: await getPresignedVideoUrl(v.url),
      }))
    );

    res.json(signedVideos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// GET single video
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as any).userId;

    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    }) as any;

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const isOwner = video.project.ownerId === userId;

    const isMember = video.project.members.some(
      (member: any) => member.userId === userId
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    video.url = await getPresignedVideoUrl(video.url);

    res.json(video);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});


/*
CREATE video
POST /videos
*/
router.post("/", authMiddleware, async (req, res) => {
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
