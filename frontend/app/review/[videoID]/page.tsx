"use client";

import { useEffect, useState } from "react";
import VideoCanvas from "@/components/review/VideoCanvas";
import type { FrameAnnotation, Stroke } from "@/types/annotation";

/* =======================
   TYPES
======================= */

type Comment = {
  id: string;
  time: number;
  text: string;
};

type HistoryAction = {
  time: number;
  stroke: Stroke;
};

/* =======================
   PAGE
======================= */

export default function ReviewPage({
  params,
}: {
  params: { videoId: string };
}) {
  /* -------- Tool State -------- */
  const [tool, setTool] = useState<
    "pen" | "eraser" | "highlighter" | "rect" | "arrow"
  >("pen");

  const [strokeSize, setStrokeSize] = useState(3);
  const [strokeColor, setStrokeColor] = useState("#ff0000");
  const [isDrawMode, setIsDrawMode] = useState(false);

  /* -------- Data State -------- */
  const [annotations, setAnnotations] = useState<FrameAnnotation[]>([]);
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  /* =======================
     VIDEO HELPERS
  ======================= */

  const getVideo = () =>
    document.querySelector("video") as HTMLVideoElement | null;

  const getCurrentTime = () => {
    const video = getVideo();
    return video?.currentTime ?? 0;
  };

  const togglePlay = () => {
    const video = getVideo();
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const seekToTime = (time: number) => {
    const video = getVideo();
    if (!video) return;

    video.pause();
    video.currentTime = time;

    // 🔥 force canvas redraw
    video.dispatchEvent(new Event("seeked"));
  };

  /* =======================
     ANNOTATIONS
  ======================= */

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

  /* =======================
     COMMENTS
  ======================= */

  const addComment = () => {
    if (!commentInput.trim()) return;

    setComments(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        time: getCurrentTime(),
        text: commentInput.trim(),
      },
    ]);

    setCommentInput("");
  };

  /* =======================
     GLOBAL SHORTCUTS
  ======================= */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }

      if (e.code === "Escape") {
        setIsDrawMode(false);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  /* =======================
     UI
  ======================= */

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

        {/* Video */}
        <div className="flex-1 flex items-center justify-center bg-black">
          <VideoCanvas
            tool={tool}
            strokeSize={strokeSize}
            strokeColor={strokeColor}
            isDrawMode={isDrawMode}
            annotations={annotations}
            onStrokeComplete={addStroke}
          />
        </div>

        {/* Comments */}
        <div className="w-[320px] border-l border-white/10 bg-[#111111] p-4 flex flex-col">
          <h2 className="text-sm font-medium mb-3">Comments</h2>

          <textarea
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            placeholder="Add comment…"
            className="mb-2 resize-none rounded bg-[#1a1a1a] border border-white/10 p-2 text-sm"
            rows={3}
          />

          <button
            onClick={addComment}
            className="mb-4 py-2 text-sm rounded bg-purple-600"
          >
            Add Comment
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            {comments.map(c => (
              <div
                key={c.id}
                onClick={() => seekToTime(c.time)}
                className="cursor-pointer rounded bg-[#151515] p-2 hover:bg-[#1f1f1f]"
              >
                <div className="text-xs text-purple-400">
                  {c.time.toFixed(2)}s
                </div>
                <div className="text-sm">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="h-20 border-t border-white/10 bg-[#0b0b0b] px-6 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-white/10 rounded"
          >
            Play / Pause
          </button>

          <button
            onClick={() => setIsDrawMode(p => !p)}
            className={`px-4 py-2 rounded ${
              isDrawMode ? "bg-purple-600" : "bg-white/10"
            }`}
          >
            {isDrawMode ? "Draw ON" : "Draw OFF"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setTool("pen")} className="bg-white/10 px-3 py-2 rounded">Pen</button>
          <button onClick={() => setTool("highlighter")} className="bg-white/10 px-3 py-2 rounded">Highlight</button>
          <button onClick={() => setTool("rect")} className="bg-white/10 px-3 py-2 rounded">Rect</button>
          <button onClick={() => setTool("arrow")} className="bg-white/10 px-3 py-2 rounded">Arrow</button>
          <button onClick={() => setTool("eraser")} className="bg-white/10 px-3 py-2 rounded">Eraser</button>

          <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} />
          <input type="range" min={1} max={20} value={strokeSize} onChange={e => setStrokeSize(+e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button onClick={undo} className="bg-white/10 px-3 py-2 rounded">Undo</button>
          <button onClick={redo} className="bg-white/10 px-3 py-2 rounded">Redo</button>
        </div>
      </div>
    </div>
  );
}
