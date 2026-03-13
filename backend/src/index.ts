import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import projectsRoutes from "./routes/projects";
import videosRoutes from "./routes/videos";
import commentsRoutes from "./routes/comments";
import annotationsRoutes from "./routes/annotations";
import videoRoutes from "./routes/videos";
import annotationRoutes from "./routes/annotations";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

/* ======================
   MIDDLEWARE
====================== */

app.use(cors());
app.use(express.json());
app.use("/projects", projectsRoutes);
app.use("/videos", videosRoutes);
app.use("/comments", commentsRoutes);
app.use("/annotations", annotationsRoutes);
app.use("/videos", videoRoutes);
app.use("/annotations", annotationRoutes);
app.use("/auth", authRoutes);

/* ======================
   ROUTES
====================== */

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "framesync-backend",
  });
});

/* ======================
   SERVER START
====================== */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 FrameSync backend running on port ${PORT}`);
});