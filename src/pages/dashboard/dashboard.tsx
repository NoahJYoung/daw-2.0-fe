import React, { useState } from "react";
import { useFileSystem } from "@/hooks";
import { Link } from "@tanstack/react-router";

export const Dashboard: React.FC = () => {
  const { projects, isLoading, deleteProject } = useFileSystem();

  return (
    <div className="flex flex-col gap-4 p-6 max-w-4xl mx-auto">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Projects</h2>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((project) => (
              <span className="p-3 border rounded-md hover:bg-gray-50 transition-colors">
                <Link
                  key={project.id}
                  to="/studio/$projectId"
                  params={{ projectId: project.id }}
                >
                  <div className="flex gap-1 font-medium text-black">
                    <span>{project.name}</span>
                    <span>{project.id}</span>
                    <span>{project.bpm}</span>
                  </div>
                </Link>
                <button
                  className="text-black"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await deleteProject(project.id);
                  }}
                >
                  Delete
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 py-8 text-center">
            No projects found. Create your first project below.
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>

        <div className="mt-4">
          <Link
            to="/studio"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            New Project
          </Link>

          <Link
            to="/studio/DEMO"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Demo Project
          </Link>
        </div>
      </div>
    </div>
  );
};
