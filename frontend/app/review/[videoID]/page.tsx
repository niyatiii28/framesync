"use client";

import { useEffect, useState, use } from "react";
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
  params: Promise<{ videoID: string }>;
}) {
  const { videoID } = use(params);

  const [tool, setTool] = useState<
    "pen" | "eraser" | "highlighter" | "rect" | "arrow"
  >("pen");

  const [strokeSize, setStrokeSize] = useState(3);
  const [strokeColor, setStrokeColor] = useState("#ff0000");
  const [isDrawMode, setIsDrawMode] = useState(false);

  const [annotations, setAnnotations] = useState<FrameAnnotation[]>([]);
  const [undoStack, setUndoStack] = useState<HistoryAction[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryAction[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    /* LOAD VIDEO */
    fetch(`http://localhost:4000/videos/${videoID}`)
      .then(res => res.json())
      .then(data => setVideo(data))
      .catch(err => console.error(err));

    /* LOAD ANNOTATIONS */
    fetch(`http://localhost:4000/annotations/${videoID}`)
      .then(res => res.json())
      .then(data => setAnnotations(data))
      .catch(err => console.error(err));

    /* LOAD COMMENTS */
    fetch(`http://localhost:4000/comments/${videoID}`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));

  }, [videoID]);

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

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const seekToTime = (time: number) => {
    const video = getVideo();
    if (!video) return;

    video.pause();
    video.currentTime = time;
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

    fetch("http://localhost:4000/annotations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: videoID,
        time,
        strokes: [stroke],
        color: strokeColor,
      }),
    }).catch(err => console.error(err));
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

    const time = getCurrentTime();
    const text = commentInput.trim();

    setComments(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        time,
        text,
      },
    ]);

    setCommentInput("");

    fetch("http://localhost:4000/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId: videoID,
        time,
        text,
      }),
    }).catch(err => console.error(err));
  };

  /* =======================
     SHORTCUTS
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
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-white">

      {/* Header */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">FrameSync Review</h1>
          <span className="text-xs text-gray-400">
            Video ID: {videoID}
          </span>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm bg-white/10 rounded-lg hover:bg-white/20">
            Share
          </button>

          <button className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            Export
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* VIDEO AREA */}
        <div className="flex-1 flex flex-col items-center justify-center p-10">

          {/* Video */}
          <div className="w-full max-w-[1100px] rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
            <VideoCanvas
              videoUrl="https://www.w3schools.com/html/mov_bbb.mp4"
              tool={tool}
              strokeSize={strokeSize}
              strokeColor={strokeColor}
              isDrawMode={isDrawMode}
              annotations={annotations}
              onStrokeComplete={addStroke}
            />
          </div>

          {/* Timeline */}
          <div className="w-full max-w-[1100px] mt-4">

            <div className="relative h-2 bg-[#141414] rounded">

              {comments.map(c => (
                <div
                  key={c.id}
                  onClick={() => seekToTime(c.time)}
                  className="absolute w-3 h-3 bg-purple-500 rounded-full cursor-pointer hover:scale-125 transition"
                  style={{
                    left: `${(c.time / 20) * 100}%`,
                    top: "-4px",
                  }}
                />

              ))}

            </div>

          </div>

        </div>

        {/* COMMENTS */}
        <div className="w-[380px] border-l border-white/10 bg-[#0f0f0f] flex flex-col">

          <div className="p-6 border-b border-white/10">
            <h2 className="text-sm font-semibold mb-3">
              Comments
            </h2>

            <textarea
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="w-full resize-none rounded-lg bg-[#1a1a1a] border border-white/10 p-3 text-sm mb-3"
              rows={3}
            />

            <button
              onClick={addComment}
              className="w-full py-2 text-sm rounded-lg bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Add Comment
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">

            {comments.map(c => (
              <div
                key={c.id}
                onClick={() => seekToTime(c.time)}
                className="cursor-pointer rounded-xl bg-[#141414] p-3 hover:bg-[#1c1c1c] transition"
              >
                <div className="text-xs text-purple-400 mb-1">
                  {c.time.toFixed(2)}s
                </div>

                <div className="text-sm text-gray-200">
                  {c.text}
                </div>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* FLOATING TOOLBAR */}
      <div className="h-20 border-t border-white/10 flex items-center justify-center">

        <div className="flex items-center gap-3 bg-[#111] border border-white/10 px-6 py-3 rounded-2xl">

          <button
            onClick={togglePlay}
            className="px-4 py-2 bg-white/10 rounded-lg"
          >
            Play
          </button>

          <button
            onClick={() => setIsDrawMode(p => !p)}
            className={`px-4 py-2 rounded-lg ${
              isDrawMode
                ? "bg-purple-600"
                : "bg-white/10"
            }`}
          >
            Draw
          </button>

          <button onClick={() => setTool("pen")} className="px-3 py-2 bg-white/10 rounded-lg">Pen</button>
          <button onClick={() => setTool("highlighter")} className="px-3 py-2 bg-white/10 rounded-lg">Highlight</button>
          <button onClick={() => setTool("rect")} className="px-3 py-2 bg-white/10 rounded-lg">Rect</button>
          <button onClick={() => setTool("arrow")} className="px-3 py-2 bg-white/10 rounded-lg">Arrow</button>
          <button onClick={() => setTool("eraser")} className="px-3 py-2 bg-white/10 rounded-lg">Eraser</button>

          <input
            type="color"
            value={strokeColor}
            onChange={e => setStrokeColor(e.target.value)}
          />

          <input
            type="range"
            min={1}
            max={20}
            value={strokeSize}
            onChange={e => setStrokeSize(+e.target.value)}
          />

          <button onClick={undo} className="px-3 py-2 bg-white/10 rounded-lg">
            Undo
          </button>

          <button onClick={redo} className="px-3 py-2 bg-white/10 rounded-lg">
            Redo
          </button>

        </div>

      </div>

    </div>
  );
}