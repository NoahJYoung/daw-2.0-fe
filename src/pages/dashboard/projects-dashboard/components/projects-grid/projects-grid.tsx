import { useState } from "react";
import { Download, MoreHorizontal, Music2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Project,
  useFileSystem,
} from "@/hooks/use-file-system/use-file-system";
import { formatBytes } from "@/hooks/use-file-system/helpers";
import { getTimeSignatureLabel } from "@/pages/studio/audio-engine/types";
import { useNavigate } from "@tanstack/react-router";
import { useThemeContext } from "@/hooks";

export const ProjectsGrid = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { deleteProject, getProjectById, isLoading, projects } =
    useFileSystem();
  const { theme } = useThemeContext();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.id);
    }
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleDownload = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const project = getProjectById(projectId);
    if (project) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(project.data);
      link.download = `${project.name}.zip`;
      link.click();

      URL.revokeObjectURL(link.href);
    }
  };

  const handleDropdownOpenChange = (open: boolean, projectId: string) => {
    setOpenDropdownId(open ? projectId : null);
  };

  const maskGradient =
    theme === "dark"
      ? "linear-gradient(to bottom, transparent, black 20px, black calc(100% - 20px), transparent)"
      : "linear-gradient(to bottom, transparent, white 20px, white calc(100% - 20px), transparent)";

  return isLoading ? null : (
    <>
      <div
        className="shrink-0 w-full grid py-4 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-3 h-fit max-h-full overflow-y-auto no-scrollbar"
        style={{
          maskImage: maskGradient,
          WebkitMaskImage: maskGradient,
        }}
      >
        {projects?.length
          ? projects.map((project) => (
              <Card
                key={project.id}
                className={`min-w-max bg-surface-0 shrink-0 w-full overflow-hidden cursor-pointer transition-all duration-300
              
              ${openDropdownId === project.id ? "lg:scale-105" : ""} 
              hover:lg:scale-105 `}
                onClick={() => navigate({ to: `/studio/${project.id}` })}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4 pb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                    <Music2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="grid gap-1">
                    <h3 className="font-semibold leading-none tracking-tight">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.key.replace("b", "♭").replace("#", "♯")} •{" "}
                      {getTimeSignatureLabel(project.timeSignature.toString())}
                    </p>
                  </div>
                  <DropdownMenu
                    onOpenChange={(open) =>
                      handleDropdownOpenChange(open, project.id)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleDownload(e, project.id)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleDelete(e, project)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">BPM</span>
                      <span>{project.bpm}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Size</span>
                      <span>{formatBytes(project.size)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 text-xs text-muted-foreground">
                  Last modified{" "}
                  {formatDistanceToNow(new Date(project.lastModified))} ago
                </CardFooter>
              </Card>
            ))
          : null}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {projectToDelete?.name}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
