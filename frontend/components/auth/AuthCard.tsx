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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b0b] via-[#0f0f0f] to-[#141414]">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111]/80 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_20px_60px_rgba(0,0,0,0.6)] p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          {title}
        </h1>

        <p className="text-sm text-gray-400 mt-1 mb-8">
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  );
}
