"use client";

import { useRef, useEffect } from "react";
import type { FrameAnnotation, Stroke } from "@/types/annotation";

type Props = {
  tool: "pen" | "eraser" | "highlighter";
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
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeRef = useRef<Stroke | null>(null);

  /* =======================
     CANVAS SETUP
  ======================= */
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
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }

    return () => window.removeEventListener("resize", resize);
  }, []);

  /* =======================
     REDRAW ALL ANNOTATIONS
  ======================= */
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
          ctx.save();

          ctx.lineWidth = stroke.size;
          ctx.strokeStyle = stroke.color ?? "red";
          ctx.globalAlpha = stroke.opacity ?? 1;

          if (stroke.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
          } else {
            ctx.globalCompositeOperation = "source-over";
          }

          ctx.beginPath();
          stroke.points.forEach((p, i) =>
            i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          );
          ctx.stroke();

          ctx.restore();
        });
      });
  };

  /* 🔥 redraw on annotations change (undo/redo fix) */
  useEffect(() => {
    redrawAll();
  }, [annotations]);

  /* =======================
     DRAWING HANDLERS
  ======================= */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawMode || !ctxRef.current) return;

    videoRef.current?.pause();

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };

    const isHighlighter = tool === "highlighter";

    currentStrokeRef.current = {
      tool: tool === "highlighter" ? "pen" : tool,
      size: isHighlighter ? strokeSize * 2 : strokeSize,
      color: strokeColor,
      opacity: isHighlighter ? 0.3 : 1,
      points: [{ x, y }],
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      !isDrawingRef.current ||
      !ctxRef.current ||
      !lastPointRef.current ||
      !currentStrokeRef.current
    )
      return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = ctxRef.current;
    const stroke = currentStrokeRef.current;

    ctx.save();

    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.color;
    ctx.globalAlpha = stroke.opacity ?? 1;

    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.globalCompositeOperation = "source-over";
    }

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.restore();

    stroke.points.push({ x, y });
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
