import VideoCard from "@/components/project/VideoCard";

const videos = [
  {
    id: "v1",
    title: "Product Demo Final",
    duration: "02:34",
  },
  {
    id: "v2",
    title: "Instagram Cut",
    duration: "00:45",
  },
  {
    id: "v3",
    title: "YouTube Long Version",
    duration: "05:12",
  },
];

export default function ProjectPage({
  params,
}: {
  params: { projectId: string };
}) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] px-8 py-6">
      <h1 className="text-2xl font-semibold mb-1">
        Project
      </h1>

      <p className="text-sm text-gray-400 mb-6">
        Project ID: {params.projectId}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(video => (
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
