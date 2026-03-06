"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import VideoCard from "@/components/project/VideoCard";

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
    <div className="min-h-screen bg-[#0f0f0f] px-8 py-6">
      <h1 className="text-2xl font-semibold mb-1">
        Project
      </h1>

      <p className="text-sm text-gray-400 mb-6">
        Project ID: {projectID}
      </p>

      <button
        onClick={() => setShowUpload(!showUpload)}
        className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium"
      >
        Upload Video
      </button>

      {showUpload && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">

          <div className="w-[420px] bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-xl">

            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold">Upload Video</h2>

              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">

              <input
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[#0f0f0f] border border-white/10 focus:outline-none focus:border-blue-500"
              />

              <input
                placeholder="Video URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[#0f0f0f] border border-white/10 focus:outline-none focus:border-blue-500"
              />

              <input
                placeholder="Duration (seconds)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[#0f0f0f] border border-white/10 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={createVideo}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
              >
                Save Video
              </button>

            </div>

          </div>

        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.id}
            title={video.title}
            duration={video.duration}
          />
        ))}
      </div>
    </div>
  );
}