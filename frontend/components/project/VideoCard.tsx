import Link from "next/link";
import { Play } from "lucide-react";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

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
      <div className="group rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden hover:bg-zinc-800/50 hover:border-white/10 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 relative backdrop-blur-sm">
        
        {/* Subtle background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Thumbnail Area */}
        <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-white/5">
          {/* Abstract background pattern for thumbnail */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 opacity-50 group-hover:scale-105 transition-transform duration-700" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-60" />

          {/* Play Button */}
          <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/80 transition-all duration-300 shadow-xl border border-white/10 group-hover:border-purple-400/50 relative z-10 text-white group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <Play className="w-6 h-6 ml-1 fill-current" />
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-3 right-3 text-xs font-mono font-medium bg-black/60 backdrop-blur-md border border-white/10 text-zinc-300 px-2 py-1 rounded-lg shadow-lg">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-5 relative z-10">
          <h4 className="text-base font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {title}
          </h4>
        </div>
      </div>
    </Link>
  );
}