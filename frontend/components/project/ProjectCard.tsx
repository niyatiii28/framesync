import Link from "next/link";
import { Folder, Video } from "lucide-react";

type ProjectCardProps = {
  id: string;
  name: string;
  description: string;
  videoCount: number;
};

export default function ProjectCard({
  id,
  name,
  description,
  videoCount,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <div className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-6 hover:bg-zinc-800/50 hover:border-white/10 transition-all duration-300 relative overflow-hidden backdrop-blur-sm cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
        
        {/* Subtle background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
            <Folder className="w-5 h-5" />
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-white/5 text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
            <Video className="w-3.5 h-3.5 text-rose-400/80" />
            {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-white transition-colors relative z-10">
          {name}
        </h3>

        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed relative z-10 group-hover:text-zinc-300 transition-colors">
          {description}
        </p>

        {/* Decorative element bottom right */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-500 pointer-events-none" />
      </div>
    </Link>
  );
}