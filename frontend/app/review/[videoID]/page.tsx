"use client";

import { useState } from "react";
import VideoCanvas from "@/components/review/VideoCanvas";
import type { FrameAnnotation, Stroke } from "@/types/annotation";

type HistoryAction = {
  time: number;
  stroke: Stroke;
};

export default function ReviewPage({
  params,
}: {
  params: { videoId: string };
}) {
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeSize, setStrokeSize] = useState(3);
  const [isDrawMode, setIsDrawMode] = useState(false);

  const [annotations, setAnnotations] = useState<FrameAnnotation[]>([]);
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);

  /* ---------------- ADD STROKE ---------------- */
  const addStroke = (stroke: Stroke, time: number) => {
    setAnnotations(prev => {
      const existing = prev.find(a => Math.abs(a.time - time) < 0.05);

      if (existing) {
        return prev.map(a =>
          a === existing
            ? { ...a, strokes: [...a.strokes, stroke] }
            : a
        );
      }

      return [...prev, { time, strokes: [stroke] }];
    });

    setUndoStack(prev => [...prev, { time, stroke }]);
    setRedoStack([]);
  };

  /* ---------------- UNDO ---------------- */
  const undo = () => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;

      const last = prev[prev.length - 1];

      setAnnotations(ann =>
        ann.map(a =>
          Math.abs(a.time - last.time) < 0.05
            ? { ...a, strokes: a.strokes.slice(0, -1) }
            : a
        )
      );

      setRedoStack(r => [...r, last]);
      return prev.slice(0, -1);
    });
  };

  /* ---------------- REDO ---------------- */
  const redo = () => {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;

      const last = prev[prev.length - 1];

      setAnnotations(ann => {
        const existing = ann.find(a => Math.abs(a.time - last.time) < 0.05);

        if (existing) {
          return ann.map(a =>
            a === existing
              ? { ...a, strokes: [...a.strokes, last.stroke] }
              : a
          );
        }

        return [...ann, { time: last.time, strokes: [last.stroke] }];
      });

      setUndoStack(u => [...u, last]);
      return prev.slice(0, -1);
    });
  };

  return (
    <div className="h-screen bg-[#0f0f0f] flex flex-col">

      {/* Top Bar */}
      <div className="h-14 border-b border-white/10 px-6 flex items-center">
        <h1 className="text-sm font-medium">Video Review</h1>
        <span className="ml-2 text-xs text-gray-400">
          Video ID: {params.videoId}
        </span>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Video + Canvas */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <VideoCanvas
            tool={tool}
            strokeSize={strokeSize}
            isDrawMode={isDrawMode}
            annotations={annotations}
            onStrokeComplete={addStroke}
          />
        </div>

        {/* Comments */}
        <div className="w-[320px] border-l border-white/10 bg-[#111111] p-4">
          <h2 className="text-sm font-medium mb-4">Comments</h2>
          <p className="text-xs text-gray-500">
            Comments will appear here
          </p>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="h-20 border-t border-white/10 bg-[#0b0b0b] px-6 flex items-center justify-between">

        {/* Playback */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              const video = document.querySelector("video");
              if (!video) return;
              video.paused ? video.play() : video.pause();
            }}
            className="px-4 py-2 text-sm rounded bg-white/10"
          >
            Play / Pause
          </button>

          <button
            onClick={() => setIsDrawMode(p => !p)}
            className={`px-4 py-2 text-sm rounded ${
              isDrawMode ? "bg-purple-600" : "bg-white/10"
            }`}
          >
            {isDrawMode ? "Draw ON" : "Draw OFF"}
          </button>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-3">
          <button onClick={() => setTool("pen")} className="px-3 py-2 bg-white/10 rounded">
            Pen
          </button>
          <button onClick={() => setTool("eraser")} className="px-3 py-2 bg-white/10 rounded">
            Eraser
          </button>

          <input
            type="range"
            min={1}
            max={20}
            value={strokeSize}
            onChange={e => setStrokeSize(+e.target.value)}
            className="w-28"
          />
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-2">
          <button onClick={undo} className="px-3 py-2 bg-white/10 rounded">
            Undo
          </button>
          <button onClick={redo} className="px-3 py-2 bg-white/10 rounded">
            Redo
          </button>
        </div>
      </div>
    </div>
  );
}
