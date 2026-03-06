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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            duration={video.duration}
          />
        ))}
      </div>
    </div>
  );
}