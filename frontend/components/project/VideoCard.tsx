type VideoCardProps = {
  title: string;
  duration: string;
};

export default function VideoCard({
  title,
  duration,
}: VideoCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111111]/80 p-4 hover:border-white/20 transition cursor-pointer">
      <div className="aspect-video bg-black/40 rounded-md mb-3" />

      <h4 className="text-sm font-medium mb-1">
        {title}
      </h4>

      <p className="text-xs text-gray-400">
        Duration: {duration}
      </p>
    </div>
  );
}
