"use client";

import { useEffect, useState, use } from "react";

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    fetch(`https://framesync-knk8.onrender.com/projects/share/${token}`)
      .then((res) => res.json())
      .then((data) => setProject(data));
  }, [token]);

  if (!project) {
    return <div className="p-10 text-white">Loading shared project...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-8">{project.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.videos.map((video: any) => (
            <a
            key={video.id}
            href={`/review/${video.id}`}
            className="block bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.02] transition"
            >
            <video
                src={video.url}
                className="w-full"
                muted
            />

            <div className="p-4">
                <h2 className="font-medium text-white">{video.title}</h2>
            </div>
            </a>
        ))}
        </div>
    </div>
  );
}
