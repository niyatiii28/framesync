"use client";

import { useEffect, useState, use } from "react";
import VideoCard from "@/components/project/VideoCard";
import { Plus, X, Video, PlaySquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectID: string }>;
}) {
  const { projectID } = use(params);

  const [videos, setVideos] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [duration, setDuration] = useState("");

  const createVideo = async () => {
  try {
    const res = await fetch("http://localhost:4000/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        url,
        duration: Number(duration),
        projectId: projectID,
      }),
    });

    const newVideo = await res.json();

    setVideos((prev) => [newVideo, ...prev]);

    setTitle("");
    setUrl("");
    setDuration("");
    setShowUpload(false);
  } catch (error) {
    console.error(error);
  }
};
  useEffect(() => {
    fetch(`http://localhost:4000/videos/project/${projectID}`)
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error(err));
  }, [projectID]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-500/30">
      
      {/* Premium Header/Hero */}
      <div className="relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl pt-16 pb-12 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-8 relative z-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <PlaySquare className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Project Videos
                </h1>
              </div>
              <p className="text-zinc-400 font-mono text-sm inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                ID: {projectID}
              </p>
            </div>

            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-white/10 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Upload Video
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex flex-col gap-8">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
              <Video className="w-5 h-5 text-zinc-400" />
              All Videos ({videos.length})
            </h2>
          </div>

          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-zinc-900/30 border border-white/5 rounded-3xl border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                <Video className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">No videos yet</h3>
              <p className="text-zinc-500 text-center max-w-sm mb-6 leading-relaxed">
                Upload your first video to start collaborating and making annotations with your team.
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
              >
                <Plus className="w-4 h-4" />
                Upload New Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  duration={video.duration}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal (Glassmorphic) */}
      {showUpload && (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md z-50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black animate-in zoom-in-95 duration-200 relative overflow-hidden">
            
            {/* Modal glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-xl font-semibold text-white">Upload New Video</h2>
              <button
                onClick={() => setShowUpload(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-5 relative z-10">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Video Title</label>
                <input
                  placeholder="e.g. Homepage Walkthrough"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Video URL (mp4)</label>
                <input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 ml-1">Duration (seconds)</label>
                <input
                  type="number"
                  placeholder="e.g. 120"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 text-sm transition-all placeholder:text-zinc-600"
                />
              </div>

              <button
                onClick={createVideo}
                className="mt-4 w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                Upload Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}