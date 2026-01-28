  "use client";

  import {useRef, useEffect, useState} from "react";
  import VideoCanvas from "@/components/VideoCanvas";

  type Tool = "pen" | "eraser";

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

  export default function Home() {
    const videoCanvasRef = useRef<{clearCanvas: () => void} | null>(null);
    const [tool, setTool] = useState<Tool>("pen");
    const [strokeSize, setStrokeSize] = useState(3);
    const [isDrawMode, setIsDrawMode] = useState(false);
    const [annotations, setAnnotations] = useState<FrameAnnotation[]>([]);

    return (
      <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>

        {/* Header */}
        <div style={{height: 48, background: "#000000", color: "white", padding: 10}}>
          Framesync
        </div>

        {/* Main content */}
        <div style={{flex: 1, display: "flex"}}>

          {/* Left palette */}
          <div style={{
            width: 80, 
            background: "#232323", 
            padding: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
          >
            <button onClick={() => setTool("pen")}>Pen</button>
            <button onClick={() => setTool("eraser")}>Eraser</button>
            <button onClick={() => {
              videoCanvasRef.current?.clearCanvas();
            }}
            >
              Clear
            </button>

            <label style={{ color: "white", fontSize: 12}}>Size</label>
            <input 
              type="range"
              min={1}
              max={20}
              value={strokeSize}
              onChange={(e) => setStrokeSize(Number(e.target.value))} 
            />
          </div>

          {/* Centre video area */}
          <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
            <VideoCanvas 
              ref = {videoCanvasRef} 
              tool = {tool}
              strokeSize = {strokeSize} 
              isDrawMode = {isDrawMode}
              onStrokeComplete={(stroke, time) => {
                setAnnotations(prev => {
                  const existing = prev.find(f => Math.abs(f.time - time) < 0.05);

                  if(existing) {
                    return prev.map(f =>
                      f === existing
                        ? { ...f, strokes: [...f.strokes, stroke]}
                        : f
                    );
                  }

                  return [...prev, {time, strokes: [stroke]}];
                });
              }}
              />
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
