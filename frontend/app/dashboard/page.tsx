import ProjectCard from "@/components/project/ProjectCard";

const projects = [
  {
    id: "1",
    name: "Product Demo Video",
    description: "Landing page product walkthrough",
    videoCount: 3,
  },
  {
    id: "2",
    name: "Marketing Campaign",
    description: "Instagram & YouTube ads",
    videoCount: 5,
  },
  {
    id: "3",
    name: "Client Explainer",
    description: "Onboarding explainer video",
    videoCount: 2,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            name={project.name}
            description={project.description}
            videoCount={project.videoCount}
          />
        ))}
      </div>
    </div>
  );
}
