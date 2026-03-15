"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      // save token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userEmail", data.user.email);

      // redirect
      router.push("/dashboard");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Collaborate, review, and ship videos faster"
    >
      <form onSubmit={handleSignup} className="space-y-4">

        <input
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium shadow-inner"
        />

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
          Create account
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}