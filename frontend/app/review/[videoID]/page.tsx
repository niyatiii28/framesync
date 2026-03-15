"use client";

import { useEffect, useState, useRef, use } from "react";
import type { FrameAnnotation, Stroke } from "@/types/annotation";
import { Play, Pen, Highlighter, Square, ArrowUpRight, Eraser, Undo, Redo, Share2, Download, MessageSquare, Pause, ArrowLeft } from "lucide-react";
import VideoCanvas from "@/components/review/VideoCanvas";
import { apiFetch } from "@/lib/api";
import { io } from "socket.io-client";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
const avatarColors = [
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-blue-500",
  "bg-emerald-500",
];

/* =======================
   TYPES
======================= */

type Comment = {
  id: string;
  time: number;
  text: string;
  x?: number;
  y?: number;

  user?: {
    id: string;
    name: string;
  };
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
  const [viewers, setViewers] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [pendingCommentPos, setPendingCommentPos] = useState<{time: number, x: number, y: number} | null>(null);

  const [video, setVideo] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [collaborators, setCollaborators] = useState<any[]>([]);

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // 1. Fetch video details
    apiFetch(`http://localhost:4000/videos/${videoID}`)
      .then(data => {
        setVideo(data);

        const owner = {
          id: data.project.ownerId,
          name: data.project.owner?.name || "Owner"
        };

        const members = data.project.members.map((m: any) => m.user);

        setCollaborators([owner, ...members]);
      })
      .catch(err => console.error(err));

    // 2. Fetch annotations
    apiFetch(`https://framesync-knk8.onrender.com/annotations/${videoID}`)
      .then(data => {
        const parsed = data.map((a: any) => ({
          ...a,
          strokes: typeof a.strokes === "string" ? JSON.parse(a.strokes) : a.strokes,
        }));
        setAnnotations(parsed);
      })
      .catch(err => console.error(err));

    // 3. Fetch comments
    apiFetch(`https://framesync-knk8.onrender.com/comments/${videoID}`)
      .then(data => setComments(data))
      .catch(err => console.error(err));

  }, [videoID]);

  useEffect(() => {
    const socket = io("https://framesync-knk8.onrender.com");

    // Join this video's room
    socket.emit("join-video", videoID);

    // Live comments
    socket.on("new-comment", (comment) => {
      setComments(prev => [...prev, comment]);
    });

    // Active viewers
    socket.on("active-viewers", (users) => {
      setViewers(users);
    });

    return () => {
      socket.disconnect();
    };
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

    if (!video.paused && !isScrubbing) {
       video.pause();
    }
    
    video.currentTime = time;
    setCurrentTime(time);
    video.dispatchEvent(new Event("seeked"));
  };

  /* =======================
     SCRUBBING
  ======================= */
  
  const handleTimelineScrub = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos)); // Clamp between 0 and 1
    
    seekToTime(pos * (duration || video?.duration || 1));
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

    apiFetch("https://framesync-knk8.onrender.com/annotations", {
      method: "POST",
      body: JSON.stringify({
        videoId: videoID,
        time,
        strokes: [stroke],
        color: stroke.color,
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
  
  const handleCanvasClick = (time: number, x: number, y: number) => {
    if (isDrawMode) return;
    setPendingCommentPos({ time, x, y });
    
    // Focus the comment input
    setTimeout(() => {
      document.getElementById("comment-input")?.focus();
    }, 50);
  };

  const addComment = () => {
    if (!commentInput.trim()) return;

    const time = pendingCommentPos ? pendingCommentPos.time : getCurrentTime();
    const text = commentInput.trim();
    const x = pendingCommentPos?.x;
    const y = pendingCommentPos?.y;

    setCommentInput("");
    setPendingCommentPos(null);

    apiFetch("https://framesync-knk8.onrender.com/comments", {
      method: "POST",
      body: JSON.stringify({
        videoId: videoID,
        time,
        text,
        x,
        y
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
        setPendingCommentPos(null);
      }

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekToTime(Math.max(0, getCurrentTime() - 0.05)); // roughly 1 frame at 20fps
      }

      if (e.code === "ArrowRight") {
        e.preventDefault();
        seekToTime(getCurrentTime() + 0.05); // roughly 1 frame at 20fps
      }
      
      if (e.code === "KeyC") {
        e.preventDefault();
        document.getElementById("comment-input")?.focus();
      }

      if (e.code === "KeyD") {
        e.preventDefault();
        setIsDrawMode(p => !p);
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.code === "KeyY" || (e.shiftKey && e.code === "KeyZ"))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, duration, isScrubbing]); // added dependencies

  /* =======================
     UI
  ======================= */

  const vidDuration = duration || video?.duration || 1;

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30">

      {/* Header */}
      <header className="h-16 shrink-0 border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-base font-medium tracking-tight">FrameSync Review</h1>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <span className="text-xs font-medium text-zinc-500 font-mono tracking-wider">
            {videoID.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2 mr-4">
            {collaborators.slice(0,3).map((user, i) => (
              <div
                key={user.id || i}
                title={user.name}
                className={`w-8 h-8 rounded-full border-2 border-zinc-950 ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-medium`}
              >
                {getInitials(user.name)}
              </div>
            ))}

            {collaborators.length > 3 && (
              <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-700 flex items-center justify-center text-xs font-medium">
                +{collaborators.length - 3}
              </div>
            )}
          </div>

          <span className="text-xs text-zinc-400 ml-2">
            {viewers.length} watching
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-zinc-100 text-zinc-900 hover:bg-white rounded-lg transition-colors shadow-lg shadow-white/5">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* VIDEO AREA */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950">
          
          {/* Video Container */}
          <div className="w-full max-w-5xl rounded-2xl overflow-hidden ring-1 ring-white/10 bg-black shadow-2xl shadow-black/50 relative group">
            <VideoCanvas
              videoUrl={video?.url || ""}
              tool={tool}
              strokeSize={strokeSize}
              strokeColor={strokeColor}
              isDrawMode={isDrawMode}
              annotations={annotations}
              comments={comments}
              onStrokeComplete={addStroke}
              onCanvasClick={handleCanvasClick}
              onTimeUpdate={setCurrentTime}
              onLoadedMetadata={setDuration}
            />
            {pendingCommentPos && (
              <div
                className="absolute z-20 pointer-events-none animate-in zoom-in duration-200"
                style={{ left: pendingCommentPos.x, top: pendingCommentPos.y, transform: "translate(-50%, -100%)" }}
              >
                <div className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg shadow-black/50 mb-1 whitespace-nowrap">
                  New Comment...
                </div>
                <div className="w-2 h-2 bg-indigo-500 rotate-45 -mt-1.5 mx-auto z-[-1]" />
                <div className="w-4 h-4 rounded-full border border-indigo-500/50 bg-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.5)] mt-1 animate-pulse mx-auto" />
              </div>
            )}
          </div>

          {/* Timeline Container */}
          <div className="w-full max-w-5xl mt-8 bg-zinc-900/50 border border-white/5 rounded-xl p-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400">Timeline</span>
              <span className="text-xs font-mono text-zinc-500">
                {formatTime(currentTime)} / {formatTime(vidDuration)}
              </span>
            </div>
            <div 
              className="relative h-12 bg-black/40 rounded-lg ring-1 ring-white/5 overflow-hidden group/timeline cursor-pointer"
              onMouseDown={(e) => {
                setIsScrubbing(true);
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                seekToTime(pos * vidDuration);
              }}
              onMouseMove={handleTimelineScrub}
              onTouchMove={handleTimelineScrub}
              onMouseUp={() => setIsScrubbing(false)}
              onMouseLeave={() => setIsScrubbing(false)}
              onTouchEnd={() => setIsScrubbing(false)}
            >
              
              {/* Progress Bar */}
              <div 
                className="absolute top-0 left-0 h-full bg-indigo-500/20 backdrop-blur-sm pointer-events-none"
                style={{ width: `${(currentTime / vidDuration) * 100}%` }}
              >
                <div className="absolute right-0 top-0 w-px h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              </div>

              {/* Comments markers */}
              {comments.map(c => (
                <div
                  key={c.id}
                  onClick={(e) => { e.stopPropagation(); seekToTime(c.time); }}
                  className="absolute w-1.5 h-full bg-indigo-500/50 hover:bg-indigo-400 cursor-pointer transition-colors group z-10"
                  style={{
                    left: `${(c.time / vidDuration) * 100}%`,
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-xs px-2 py-1 rounded shadow-lg transition-opacity pointer-events-none z-20">
                    {c.text.slice(0, 20)}{c.text.length > 20 ? '...' : ''}
                  </div>
                </div>
              ))}
              {/* Annotations markers */}
              {annotations.map((a, i) => (
                <div
                  key={`ann-${i}`}
                  onClick={(e) => { e.stopPropagation(); seekToTime(a.time); }}
                  className="absolute w-1 h-3/4 bottom-1/2 translate-y-1/2 bg-rose-500/50 hover:bg-rose-400 rounded-full cursor-pointer transition-colors z-20"
                  style={{
                    left: `${(a.time / vidDuration) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* COMMENTS SIDEBAR */}
        <aside className="w-[360px] shrink-0 border-l border-white/5 bg-zinc-950/80 backdrop-blur-xl flex flex-col shadow-2xl z-10">
          <div className="p-5 border-b border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-zinc-100">
              <MessageSquare className="w-4 h-4" />
              <h2 className="text-sm font-medium">Feedback & Notes</h2>
            </div>

            <div className="bg-zinc-900/50 rounded-xl p-1 border border-white/5 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30 transition-all">
              <textarea
                id="comment-input"
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder={pendingCommentPos ? "Add note to pin..." : "Leave a comment at current frame..."}
                className="w-full resize-none bg-transparent p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none min-h-[80px] custom-scrollbar"
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addComment();
                  }
                }}
              />
              <div className="flex justify-between items-center px-2 pb-2 mt-1">
                <span className="text-xs text-zinc-500 font-mono">
                  Press Enter to save
                </span>
                <button
                  onClick={addComment}
                  className="px-4 py-1.5 text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {comments.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3">
                 <MessageSquare className="w-8 h-8 opacity-20" />
                 <p className="text-sm">No comments yet.</p>
               </div>
            ) : comments.map(c => (
              <div
                key={c.id}
                onClick={() => seekToTime(c.time)}
                className="group cursor-pointer rounded-xl bg-zinc-900/40 border border-transparent hover:border-white/5 hover:bg-zinc-900/80 p-4 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                      {getInitials(c.user?.name || "User")}
                    </div>
                    <span className="text-xs font-medium text-zinc-300">
                      {c.user?.name || "User"}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {c.time.toFixed(1)}s
                  </span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed pl-8 break-words">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* FLOATING TOOLBAR */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl shadow-black/50">
            
            <button
              onClick={togglePlay}
              className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
              title="Play/Pause (Space)"
            >
              <Play className="w-5 h-5 fill-current" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1 shrink-0" />

            <button
              onClick={() => setIsDrawMode(p => !p)}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition-colors shrink-0 ${
                isDrawMode
                  ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              }`}
            >
              <Pen className="w-4 h-4 shrink-0" />
              {isDrawMode ? "Drawing" : "Draw Annotations"}
            </button>

            {isDrawMode && (
              <div className="flex items-center gap-1.5 animate-in slide-in-from-left-2 fade-in pl-2">
                <ToolButton icon={<Pen className="w-4 h-4" />} active={tool === "pen"} onClick={() => setTool("pen")} tooltip="Pen" />
                <ToolButton icon={<Highlighter className="w-4 h-4" />} active={tool === "highlighter"} onClick={() => setTool("highlighter")} tooltip="Highlighter" />
                <ToolButton icon={<Square className="w-4 h-4" />} active={tool === "rect"} onClick={() => setTool("rect")} tooltip="Rectangle" />
                <ToolButton icon={<ArrowUpRight className="w-4 h-4" />} active={tool === "arrow"} onClick={() => setTool("arrow")} tooltip="Arrow" />
                <ToolButton icon={<Eraser className="w-4 h-4" />} active={tool === "eraser"} onClick={() => setTool("eraser")} tooltip="Eraser" />

                <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden border border-white/10 ml-1 shrink-0">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={e => setStrokeColor(e.target.value)}
                    className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1 w-20 px-2 shrink-0">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={strokeSize}
                    onChange={e => setStrokeSize(+e.target.value)}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                  />
                </div>

                <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />

                <button onClick={undo} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0" title="Undo (Cmd+Z)">
                  <Undo className="w-4 h-4" />
                </button>
                <button onClick={redo} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0" title="Redo (Cmd+Y)">
                  <Redo className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ToolButton({ icon, active, onClick, tooltip }: { icon: React.ReactNode, active: boolean, onClick: () => void, tooltip: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 ${
        active 
          ? "bg-rose-500/20 text-rose-400" 
          : "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
      }`}
    >
      {icon}
    </button>
  );
}