import Link from "next/link";

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
      <div className="rounded-xl border border-white/10 bg-[#111111]/80 p-5 hover:border-white/20 transition cursor-pointer">
        <h3 className="text-lg font-medium mb-1">{name}</h3>

        <p className="text-sm text-gray-400 mb-4">
          {description}
        </p>

        <div className="text-xs text-gray-500">
          {videoCount} videos
        </div>
      </div>
    </Link>
  );
}