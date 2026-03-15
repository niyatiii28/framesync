"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      // redirect
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to continue reviewing videos"
    >
      <form onSubmit={handleLogin} className="space-y-4">

        <input
          placeholder="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium shadow-inner"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium shadow-inner"
        />

        {error && (
          <p className="text-red-400 text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}