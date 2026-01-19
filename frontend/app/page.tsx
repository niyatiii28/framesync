"use client";
import {useRef, useEffect, useState} from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isDrawMode, setIsDrawMode] = useState(false);

  const isDrawingRef = useRef(false);

  const lastPointerRef = useRef<{x: number; y: number} | null>(null);

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if(!video || !canvas) return;

    const handleLoadedMetaData = () => {
      const rect = video.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext("2d");
      if(!ctx) return;

      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.strokeStyle = "red";

      ctxRef.current = ctx;
    };

    video.addEventListener("loadedmetadata", handleLoadedMetaData);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetaData)
    };
  }, []);

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
  }

  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>

      {/* Header */}
      <div style={{height: 48, background: "#000000", color: "white", padding: 10}}>
        Framesync
      </div>

      {/* Main content */}
      <div style={{flex: 1, display: "flex"}}>

        {/* Left palette */}
        <div style={{width: 80, background: "#232323", padding: 8}}>
          Tools
        </div>

        {/* Centre video area */}
        <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
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
              style={{
                width: 600,
                position: "absolute",
                top: 0,
                left: 0,
                border: "1px solid red",
                pointerEvents: isDrawMode ? "auto" : "none"
              }}>
            </canvas>
          </div>
        </div>

        {/* Right comments */}
        <div style={{width: 300, background: "#1e1d1d", padding: 8}}>
          Comments
        </div>
      </div>
      
      {/* Bottom controls */}
      <div style={{height: 80, background: "#2b2a2a", padding: 8}}>
        <button onClick={() => setIsDrawMode(prev => !prev)}>
          {isDrawMode ? "Disable Draw Mode" : "Enable Draw Mode"}
        </button>
      </div>
    </div>

  );
}
