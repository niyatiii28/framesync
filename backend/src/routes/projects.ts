import { Router } from "express";
import prisma from "../prisma";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// GET all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const ownerId = (req as any).userId;
    const projects = await prisma.project.findMany({
      where: { ownerId },
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
    const { name, description} = req.body;
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

export default router;