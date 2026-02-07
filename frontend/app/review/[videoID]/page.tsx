"use client";

import { useState } from "react";
import VideoCanvas from "@/components/review/VideoCanvas";
import type { FrameAnnotation } from "@/types/annotation";


export default function ReviewPage({
  params,
}: {
  params: { videoId: string };
}) {
  // 🔹 Drawing state (minimal, frontend-only)
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeSize, setStrokeSize] = useState(3);
  const [isDrawMode, setIsDrawMode] = useState(true);
  const [annotations, setAnnotations] = useState<FrameAnnotation[]>([]);


  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">
      
      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium text-white">
            Video Review
          </h1>
          <span className="text-xs text-gray-400">
            Video ID: {params.videoId}
          </span>
        </div>

        {/* Simple toolbar (temporary) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool("pen")}
            className={`px-2 py-1 text-xs rounded ${
              tool === "pen" ? "bg-purple-500" : "bg-white/10"
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-2 py-1 text-xs rounded ${
              tool === "eraser" ? "bg-purple-500" : "bg-white/10"
            }`}
          >
            Eraser
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Video + Canvas */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <VideoCanvas
            tool={tool}
            strokeSize={strokeSize}
            isDrawMode={isDrawMode}
            annotations={annotations}
            onStrokeComplete={(stroke, time) => {
              setAnnotations(prev => {
                const existing = prev.find(
                  (a: any) => Math.abs(a.time - time) < 0.05
                );

                if (existing) {
                  return prev.map((a: any) =>
                    a === existing
                      ? { ...a, strokes: [...a.strokes, stroke] }
                      : a
                  );
                }

                return [...prev, { time, strokes: [stroke] }];
              });
            }}
          />
        </div>

        {/* Comments Panel */}
        <div className="w-[320px] border-l border-white/10 bg-[#111111] p-4">
          <h2 className="text-sm font-medium mb-4">
            Comments
          </h2>
          <div className="text-xs text-gray-500">
            Comments will appear here
          </div>
        </div>

      </div>
    </div>
  );
}
