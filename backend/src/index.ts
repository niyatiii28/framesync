export let io: Server;

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
import uploadRoutes from "./routes/upload";
import { createServer } from "http";
import { Server } from "socket.io";

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
app.use("/upload", uploadRoutes);

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

const httpServer = createServer(app);

io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

/* ======================
   LIVE VIEWER TRACKING
====================== */

const videoRooms: Record<string, Set<string>> = {};

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // When user opens a video review page
  socket.on("join-video", (videoId: string) => {

    socket.join(videoId);

    if (!videoRooms[videoId]) {
      videoRooms[videoId] = new Set();
    }

    videoRooms[videoId].add(socket.id);

    io.to(videoId).emit(
      "active-viewers",
      Array.from(videoRooms[videoId])
    );

  });

  socket.on("disconnect", () => {

    console.log("User disconnected:", socket.id);

    for (const videoId in videoRooms) {

      videoRooms[videoId].delete(socket.id);

      io.to(videoId).emit(
        "active-viewers",
        Array.from(videoRooms[videoId])
      );

    }

  });

});

httpServer.listen(PORT, () => {
  console.log(`🚀 FrameSync backend running on port ${PORT}`);
});
