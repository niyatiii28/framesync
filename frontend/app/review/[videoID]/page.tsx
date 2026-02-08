"use client";

import { useState } from "react";
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
  /* -------- Drawing State -------- */
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [strokeSize, setStrokeSize] = useState(3);
  const [isDrawMode, setIsDrawMode] = useState(false);

  const [annotations, setAnnotations] = useState<FrameAnnotation[]>([]);
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);

  /* -------- Comments State -------- */
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  /* -------- Helpers -------- */
  const getCurrentTime = () => {
    const video = document.querySelector("video");
    return video?.currentTime ?? 0;
  };

  const seekToTime = (time: number) => {
    const video = document.querySelector("video");
    if (!video) return;
    video.currentTime = time;
    video.pause();
  };

  /* -------- Add Stroke -------- */
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

  /* -------- Undo -------- */
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

  /* -------- Redo -------- */
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

  /* -------- Add Comment -------- */
  const addComment = () => {
    if (!commentInput.trim()) return;

    const time = getCurrentTime();

    setComments(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        time,
        text: commentInput.trim(),
      },
    ]);

    setCommentInput("");
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

        {/* Comments Panel */}
        <div className="w-[320px] border-l border-white/10 bg-[#111111] p-4 flex flex-col">

          <h2 className="text-sm font-medium mb-3">Comments</h2>

          {/* Comment Input */}
          <div className="mb-4">
            <textarea
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Add a comment at current time…"
              className="w-full resize-none rounded bg-[#1a1a1a] border border-white/10 p-2 text-sm"
              rows={3}
            />
            <button
              onClick={addComment}
              className="mt-2 w-full py-2 text-sm rounded bg-purple-600 hover:bg-purple-700"
            >
              Add Comment
            </button>
          </div>

          {/* Comment List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {comments.length === 0 && (
              <p className="text-xs text-gray-500">
                No comments yet
              </p>
            )}

            {comments.map(comment => (
              <div
                key={comment.id}
                onClick={() => seekToTime(comment.time)}
                className="cursor-pointer rounded border border-white/10 bg-[#151515] p-2 hover:bg-[#1f1f1f]"
              >
                <div className="text-xs text-purple-400 mb-1">
                  {comment.time.toFixed(2)}s
                </div>
                <div className="text-sm">
                  {comment.text}
                </div>
              </div>
            ))}
          </div>
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
          <button
            onClick={() => setTool("pen")}
            className="px-3 py-2 bg-white/10 rounded"
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className="px-3 py-2 bg-white/10 rounded"
          >
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
