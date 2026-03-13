"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, Shield, Bell, Save } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("Demo User");
  const [email, setEmail] = useState("user@framesync.app");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("userName") || "Demo User");
    setEmail(localStorage.getItem("userEmail") || "user@framesync.app");
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Premium Header/Hero */}
      <div className="relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl pt-16 pb-12">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                Account Settings
              </h1>
              <p className="text-zinc-400 text-sm">
                Manage your profile and preferences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="flex flex-col gap-1 w-full md:w-64 shrink-0">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 font-medium transition-colors text-left">
            <User className="w-4 h-4" />
            Profile Details
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors text-left font-medium">
            <Shield className="w-4 h-4" />
            Security & Password
          </button>
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-colors text-left font-medium">
            <Bell className="w-4 h-4" />
            Notifications
          </button>
        </div>

        {/* Content Panel */}
        <div className="flex-1">
          <div className="rounded-3xl border border-white/5 bg-zinc-900/30 p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            
            <h2 className="text-xl font-semibold text-white mb-6">Profile Details</h2>

            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl bg-zinc-950/50 border border-white/5 px-4 py-3 text-sm text-zinc-500 cursor-not-allowed font-medium shadow-inner"
                />
                <p className="text-xs text-zinc-500">Email address cannot be changed.</p>
              </div>

            </div>

            <div className="mt-10 pt-6 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
