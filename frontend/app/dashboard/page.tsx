"use client";

import { useEffect, useState, useRef } from "react";
import ProjectCard from "@/components/project/ProjectCard";
import { Plus, FolderGit2, Search, LayoutDashboard, User, Settings as SettingsIcon, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [userName, setUserName] = useState("Demo User");
  const [userEmail, setUserEmail] = useState("user@framesync.app");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "Demo User");
    setUserEmail(localStorage.getItem("userEmail") || "user@framesync.app");

    // Fetch projects
    fetch("http://localhost:4000/projects")
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
      
    // Handle outside click for menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const createProject = async () => {
    const res = await fetch("http://localhost:4000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "New Project",
        description: "Created from dashboard",
        ownerId: "demo-user",
      }),
    });

    const newProject = await res.json();

    setProjects(prev => [...prev, newProject]);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
      
      {/* Premium Header/Hero */}
      <div className="relative border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl pt-16 pb-12">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-8 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                Dashboard
              </h1>
            </div>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
              Manage your video review projects, collaborate with your team, and track feedback all in one place.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar (Visual Only) */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-zinc-400 focus-within:border-indigo-500/50 transition-colors w-64">
              <Search className="w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-zinc-600 text-zinc-200"
              />
            </div>
            
            <button
              onClick={createProject}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl text-sm font-semibold transition-all duration-300 shadow-lg shadow-white/10 hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>

            {/* User Profile Dropdown */}
            <div className="relative ml-2" ref={menuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-11 h-11 rounded-full bg-zinc-800 border-2 border-white/10 hover:border-indigo-500/50 flex items-center justify-center transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <User className="w-5 h-5 text-zinc-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 mb-2 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
                  </div>
                  
                  <Link 
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Account Settings
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex flex-col gap-8">
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-zinc-400" />
              Your Projects ({projects.length})
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-zinc-900/30 border border-white/5 rounded-3xl border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                <FolderGit2 className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">No projects yet</h3>
              <p className="text-zinc-500 text-center max-w-sm mb-6 leading-relaxed">
                Create a new project to start organizing your videos and collaborating on feedback.
              </p>
              <button
                onClick={createProject}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/5"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id || index}
                  id={project.id}
                  name={project.name}
                  description={project.description}
                  videoCount={project.videos?.length || 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}