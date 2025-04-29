import { useFileSystem } from "@/hooks";
import { ProjectsGrid } from "./components";
import { Link } from "@tanstack/react-router";

export const Dashboard = () => {
  const { quota } = useFileSystem();
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex flex-col bg-muted/40 max-h-full">
        <div className="p-2 pb-2">
          <div className="mx-auto max-w-7xl">
            <div className="flex w-full items-center justify-between mb-2 lg:px-2">
              <span className="flex flex-col justify-center gap-1">
                <h1 className="text-3xl font-bold">Projects</h1>
                <span className="flex gap-1 text-surface-6 text-xs lg:text-sm">
                  <p className="hidden sm:block">Used:</p>{" "}
                  <strong>{`${quota?.used} `}</strong>/
                  <strong>{` ${quota?.total}`}</strong>
                </span>
              </span>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => alert("not implemented yet")}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Import
                </button>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <Link to="/studio">New Project</Link>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <ProjectsGrid />
        </div>
      </main>
    </div>
  );
};
