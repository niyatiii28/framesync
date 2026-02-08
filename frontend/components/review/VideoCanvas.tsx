"use client";

import { useRef, useEffect } from "react";
import type { FrameAnnotation, Stroke } from "@/types/annotation";

type Props = {
  tool: "pen" | "eraser";
  strokeSize: number;
  isDrawMode: boolean;
  annotations: FrameAnnotation[];
  onStrokeComplete: (stroke: Stroke, time: number) => void;
};

export default function VideoCanvas({
  tool,
  strokeSize,
  isDrawMode,
  annotations,
  onStrokeComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);

  /* ---------------- SETUP CANVAS ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const resize = () => {
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctxRef.current = ctx;
    }

    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------------- REDRAW ALL ANNOTATIONS ---------------- */
  const redrawAll = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!ctx || !canvas || !video) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations
      .filter(a => Math.abs(a.time - video.currentTime) < 0.05)
      .forEach(a => {
        a.strokes.forEach(stroke => {
          ctx.lineWidth = stroke.size;
          ctx.strokeStyle = stroke.tool === "pen" ? "red" : "rgba(0,0,0,1)";
          ctx.globalCompositeOperation =
            stroke.tool === "pen" ? "source-over" : "destination-out";

          ctx.beginPath();
          stroke.points.forEach((p, i) =>
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          );
          ctx.stroke();
        });
      });
  };

  /* 🔥 THIS IS THE FIX 🔥
     Redraw whenever annotations change */
  useEffect(() => {
    redrawAll();
  }, [annotations]);

  /* ---------------- DRAWING ---------------- */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !ctxRef.current) return;

    videoRef.current?.pause();

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };

    currentStrokeRef.current = {
      tool,
      size: strokeSize,
      points: [{ x, y }],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !ctxRef.current || !lastPointRef.current)
      return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = ctxRef.current;
    ctx.lineWidth = strokeSize;
    ctx.strokeStyle = tool === "pen" ? "red" : "rgba(0,0,0,1)";
    ctx.globalCompositeOperation =
      tool === "pen" ? "source-over" : "destination-out";

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    currentStrokeRef.current?.points.push({ x, y });
    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    isDrawingRef.current = false;
    lastPointRef.current = null;

    onStrokeComplete(
      currentStrokeRef.current,
      videoRef.current?.currentTime ?? 0
    );

    currentStrokeRef.current = null;
  };

  return (
    <div className="relative w-[900px] h-[500px]">
      <video
        ref={videoRef}
        src="/random.mp4"
        controls
        className="w-full h-full"
        onTimeUpdate={redrawAll}
        onSeeked={redrawAll}
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-10"
        style={{ pointerEvents: isDrawMode ? "auto" : "none" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
