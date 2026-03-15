import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// GET all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const ownerId = (req as any).userId;

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId },
          {
            members: {
              some: {
                userId: ownerId,
              },
            },
          },
        ],
      },
    });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// CREATE project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = (req as any).userId;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId,
      },
    });

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// SHARE project (generate share link)
router.post("/:id/share", authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;

    const token = uuidv4();

    const project = await prisma.project.update({
      where: { id },
      data: {
        shareToken: token,
      },
    });

    res.json({
      shareLink: `${process.env.FRONTEND_URL}/share/${token}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate share link" });
  }
});

router.post("/:id/invite", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
      },
    });

    res.json({ message: "User invited successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to invite user" });
  }
});

router.get("/share/:token", async (req, res) => {
  try {
    const token = req.params.token as string;

    const project = await prisma.project.findUnique({
      where: { shareToken: token },
      include: {
        videos: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch shared project" });
  }
});

export default router;