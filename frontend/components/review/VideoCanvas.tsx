"use client";

import { useRef, useEffect } from "react";
import type { FrameAnnotation, Stroke, Point } from "@/types/annotation";

type Props = {
  videoUrl?: string
  tool: "pen" | "eraser" | "highlighter" | "rect" | "arrow";
  strokeSize: number;
  strokeColor: string;
  isDrawMode: boolean;
  annotations: FrameAnnotation[];
  comments: any[];
  onStrokeComplete: (stroke: Stroke, time: number) => void;
  onCanvasClick?: (time: number, x: number, y: number) => void;
  onTimeUpdate?: (time: number) => void;
  onLoadedMetadata?: (duration: number) => void;
};

export default function VideoCanvas({
  videoUrl,
  tool,
  strokeSize,
  strokeColor,
  isDrawMode,
  annotations,
  comments,
  onStrokeComplete,
  onCanvasClick,
  onTimeUpdate,
  onLoadedMetadata,
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
  }, [annotations, comments]);

  /* ---------- Drawing & Clicking ---------- */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const video = videoRef.current;
    if (!ctxRef.current || !video) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!isDrawMode) {
      // Handle floating comment click
      if (onCanvasClick) {
        onCanvasClick(video.currentTime, x, y);
      }
      return;
    }

    video.pause();

    const start: Point = { x, y };

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
        src={videoUrl || undefined}
        controls
        className="w-full h-full"
        onTimeUpdate={(e) => {
          redraw();
          onTimeUpdate?.(e.currentTarget.currentTime);
        }}
        onLoadedMetadata={(e) => {
          onLoadedMetadata?.(e.currentTarget.duration);
        }}
        onSeeked={redraw}
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 z-10"
        style={{ pointerEvents: "auto", cursor: isDrawMode ? "crosshair" : "pointer" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />

      {/* Floating Comment Pins */}
      {comments
        .filter(c => c.x !== undefined && c.y !== undefined && Math.abs(c.time - (videoRef.current?.currentTime || 0)) < 0.05)
        .map(c => (
          <div
            key={c.id}
            className="absolute z-20 flex flex-col items-center animate-in zoom-in duration-200"
            style={{ left: c.x, top: c.y, transform: "translate(-50%, -100%)" }}
          >
            <div className="bg-zinc-900 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl shadow-black/50 mb-1 max-w-[200px] break-words">
              {c.text}
            </div>
            <div className="w-3 h-3 bg-zinc-900 border-r border-b border-white/10 rotate-45 -mt-2.5 z-[-1]" />
            <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white/20 shadow-[0_0_10px_rgba(99,102,241,0.8)] mt-1" />
          </div>
        ))}
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
