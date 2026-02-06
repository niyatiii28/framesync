"use client";

import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue reviewing videos"
    >
      <form className="space-y-4">
        <input
          placeholder="Email address"
          type="email"
          className="w-full rounded-lg bg-[#0c0c0c] border border-white/10 px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />

        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-lg bg-[#0c0c0c] border border-white/10 px-4 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
        >
          Log in
        </button>
      </form>

      
      <p className="mt-6 text-sm text-gray-400">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="text-purple-400 hover:text-purple-300"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
