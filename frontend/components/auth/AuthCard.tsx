type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  children,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl shadow-black p-8 relative overflow-hidden">
          
          {/* Subtle inner glow */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <h1 className="text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>

          <p className="text-sm text-zinc-400 mt-2 mb-8 leading-relaxed">
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </div>
  );
}
