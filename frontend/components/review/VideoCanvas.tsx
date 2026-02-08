"use client";

import { useRef, useEffect } from "react";
import type { FrameAnnotation, Stroke, Point } from "@/types/annotation";

type Props = {
  tool: "pen" | "eraser" | "highlighter" | "rect" | "arrow";
  strokeSize: number;
  strokeColor: string;
  isDrawMode: boolean;
  annotations: FrameAnnotation[];
  onStrokeComplete: (stroke: Stroke, time: number) => void;
};

export default function VideoCanvas({
  tool,
  strokeSize,
  strokeColor,
  isDrawMode,
  annotations,
  onStrokeComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);

  /* ---------- Setup ---------- */
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
    ctxRef.current = canvas.getContext("2d");

    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ---------- Draw helpers ---------- */
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    ctx.save();
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = stroke.opacity;

    ctx.globalCompositeOperation =
      stroke.tool === "eraser" ? "destination-out" : "source-over";

    if (stroke.tool === "rect") {
      const [a, b] = stroke.points;
      ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
    } else if (stroke.tool === "arrow") {
      drawArrow(ctx, stroke.points[0], stroke.points[1]);
    } else {
      ctx.beginPath();
      stroke.points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
    }

    ctx.restore();
  };

  const redraw = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!ctx || !canvas || !video) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw saved annotations
    annotations
      .filter(a => Math.abs(a.time - video.currentTime) < 0.05)
      .forEach(a => a.strokes.forEach(s => drawStroke(ctx, s)));

    // draw current stroke preview
    if (currentStrokeRef.current) {
      drawStroke(ctx, currentStrokeRef.current);
    }
  };

  useEffect(() => {
    redraw();
  }, [annotations]);

  /* ---------- Drawing ---------- */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !ctxRef.current) return;
    videoRef.current?.pause();

    const rect = canvasRef.current!.getBoundingClientRect();
    const start: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    isDrawingRef.current = true;

    currentStrokeRef.current = {
      tool: tool === "highlighter" ? "pen" : tool,
      size: tool === "highlighter" ? strokeSize * 2 : strokeSize,
      color: strokeColor,
      opacity: tool === "highlighter" ? 0.3 : 1,
      points: [start, start],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const end: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const stroke = currentStrokeRef.current;

    if (stroke.tool === "rect" || stroke.tool === "arrow") {
      stroke.points[1] = end;
    } else {
      stroke.points.push(end);
    }

    redraw();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    isDrawingRef.current = false;

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
        onTimeUpdate={redraw}
        onSeeked={redraw}
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

/* ---------- Arrow ---------- */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point
) {
  const head = 10;
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - head * Math.cos(angle - Math.PI / 6),
    to.y - head * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    to.x - head * Math.cos(angle + Math.PI / 6),
    to.y - head * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}
