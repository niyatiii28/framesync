import Link from "next/link";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

type VideoCardProps = {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string;
};

export default function VideoCard({
  id,
  title,
  duration,
}: VideoCardProps) {
  return (
    <Link href={`/review/${id}`}>
      <div className="group rounded-xl border border-white/10 bg-[#111111] overflow-hidden hover:border-white/20 transition cursor-pointer">

      {/* Thumbnail */}
      <div className="relative aspect-video bg-black/40 flex items-center justify-center">

        {/* Play icon */}
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
          ▶
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 text-xs bg-black/70 px-2 py-0.5 rounded">
          {formatDuration(duration)}
        </div>
      </div>

      {/* Video info */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-white truncate">
          {title}
        </h4>
      </div>

      </div>
    </Link>
  );
}