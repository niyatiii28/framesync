"use client";

import {useRef, useEffect, useState, forwardRef, useImperativeHandle} from "react";

type Point = {x: number; y: number};

type Stroke = {
  tool: "pen" | "eraser";
  size: number;
  points: Point[];
};  

type FrameAnnotation = {
  time: number;
  strokes: Stroke[];
}

const VideoCanvas = forwardRef(function VideoCanvas(
  {
    tool, 
    strokeSize,
    isDrawMode,
    onStrokeComplete,
    annotations
  }: {
    tool: "pen" | "eraser"; 
    strokeSize: number;
    isDrawMode: boolean;
    onStrokeComplete: (stroke: Stroke, time: number) => void;
    annotations: FrameAnnotation[];
  },
  ref
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isDrawingRef = useRef(false);
  const lastPointerRef = useRef<{x: number; y: number} | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const currentStrokeRef = useRef<Stroke | null>(null);

  useImperativeHandle(ref, () => ({
    clearCanvas() {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;

      if(!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  }));

  // Helper function to draw a single stroke
  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    if (stroke.tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "red";
    } else if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    }

    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    ctx.stroke();
  };

  // Redraw all annotations for current time
  const redrawAnnotations = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const video = videoRef.current;

    if (!canvas || !ctx || !video) return;

    console.log("Redrawing annotations");
    console.log("Current time:", video.currentTime);
    console.log("Total annotations:", annotations);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find annotations for current time (within 0.05s tolerance)
    const currentTime = video.currentTime;
    const relevantAnnotations = annotations.filter(
      ann => Math.abs(ann.time - currentTime) < 0.05
    );

    console.log("Relevant annotations for current time:", relevantAnnotations);

    // Draw all strokes for current time
    relevantAnnotations.forEach(ann => {
      ann.strokes.forEach(stroke => {
        console.log("Drawing stroke:", stroke);
        drawStroke(ctx, stroke);
      });
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if(!video || !canvas) return;

    const handleLoadedMetaData = () => {
      const rect = video.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;

      console.log("canvas size", canvas.width, canvas.height);

      const ctx = canvas.getContext("2d");
      if(!ctx) return;

      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "red";

      ctxRef.current = ctx;
    };

    const handleTimeUpdate = () => {
      if (!isDrawingRef.current) {
        redrawAnnotations();
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetaData);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("seeked", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetaData);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("seeked", handleTimeUpdate);
    };
  }, [annotations]);

  const handleMouseDown = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if(!isDrawMode) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const video = videoRef.current;

    if(!canvas || !ctx || !video) return;
    
    video.pause();
    isDrawingRef.current = true;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastPointerRef.current = {x, y};

    currentStrokeRef.current = {
      tool,
      size: strokeSize,
      points: [{x, y}],
    };
  }

  const handleMouseMove = (
    e: React.MouseEvent<HTMLCanvasElement>
  ) => {
    if(!isDrawMode) return;
    if(!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const last = lastPointerRef.current;

    if(!canvas || !ctx || !last) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if(tool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "red";
    } else if(tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    }

    ctx.lineWidth = strokeSize;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    currentStrokeRef.current?.points.push({x, y});

    lastPointerRef.current = {x, y};
  };

  const stopDrawing = () => {
    if(isDrawingRef.current && currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      const video = videoRef.current;
      if(video) {
        console.log("Stroke completed:", currentStrokeRef.current);
        console.log("At time:", video.currentTime);
        onStrokeComplete(currentStrokeRef.current, video.currentTime);
      }
    }
    isDrawingRef.current = false;
    lastPointerRef.current = null;
    currentStrokeRef.current = null;
  };

  return (
    <div>
        <div style={{position: "relative", width: 600}}>
            <video
              ref={videoRef}
              src="/random.mp4"
              controls
              width={600}>
            </video>

            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                width: 600,
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                border: "1px solid red",
                zIndex: 10,
                pointerEvents: isDrawMode ? "auto" : "none"
              }}>
            </canvas>
          </div>
    </div>
  );
});

export default VideoCanvas;