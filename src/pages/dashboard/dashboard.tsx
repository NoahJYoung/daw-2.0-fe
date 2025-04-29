import { ProjectsGrid } from "./components";

export const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex flex-col bg-muted/40 max-h-full">
        <div className="p-6 pb-2">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Projects</h1>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 pt-2 overflow-hidden">
          <ProjectsGrid />
        </div>
      </main>
    </div>
  );
};
