import { useFileSystem } from "@/hooks";
import { EmptyProjects, ProjectsGrid } from "./components";
import { Button } from "@/components/ui/button";
import { FolderInput } from "lucide-react";

export const ProjectsDashboard = () => {
  const { quota, projects, importFile } = useFileSystem();

  const handleImportProject = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".zip";

    fileInput.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        importFile(file, "project");
      }
    });

    fileInput.click();
  };

  return (
    <section className="flex flex-col bg-muted/40 h-full lg:pt-[2%]">
      <div className="pt-3 px-3 pb-0">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex w-full items-center justify-between mb-2 lg:px-3">
            <span className="flex flex-col justify-center gap-1">
              <h1 className="text-3xl font-bold">Projects</h1>
              <span className="flex gap-1 text-surface-6 text-xs lg:text-sm">
                <p className="hidden sm:block">Used:</p>{" "}
                <strong>{`${quota?.used} `}</strong>/
                <strong>{` ${quota?.total}`}</strong>
              </span>
            </span>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleImportProject}
                className="text-surface-6 hover:bg-surface-2 inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                <FolderInput />
                Import Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <div className="mx-auto max-w-7xl w-full h-full pt-1 pb-2">
          {projects?.length ? <ProjectsGrid /> : <EmptyProjects />}
        </div>
      </div>
    </section>
  );
};
