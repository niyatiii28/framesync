"use client";

import { useEffect, useState } from "react";
import ProjectCard from "@/components/project/ProjectCard";

export default function DashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:4000/projects")
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error(err));
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

  return (
    <div className="min-h-screen bg-[#0f0f0f] px-8 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">
          Dashboard
        </h1>

        <button
          onClick={createProject}
          className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition"
        >
          + New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

    </div>
  );
}