import { Link, useNavigate } from "@tanstack/react-router";
import { useFileSystem } from "@/hooks";
import { TimeSignatureIcon } from "../studio/components/main-controls/components/timeline-controls/components";
import { HiOutlineTrash as DeleteIcon } from "react-icons/hi";
import { GrDownload } from "react-icons/gr";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatBytes } from "@/hooks/use-file-system/helpers";

const newProjectBtnClassName = `rounded-xs font-bold text-sm focus-visible:ring-0 relative flex items-center gap-2 p-1 h-8 bg-brand-1 text-white hover:bg-brand-2 hover:border-brand-2 border border-brand-1 transition-colors `;
const demoProjectBtnClassName = `rounded-xs font-bold text-sm focus-visible:ring-0 relative flex items-center gap-2 p-1 h-8 bg-surface-0 border-surface-8 border text-surface-8 hover:text-surface-7 hover:border-surface-7 hover:bg-surface-1 transition-colors`;

const getTimeSignatureIconValues = (timeSignature: number) => {
  const timeSignatureOptions: { label: string; value: string }[] = [
    { label: "2/4", value: "2" },
    { label: "3/4", value: "3" },
    { label: "4/4", value: "4" },
    { label: "5/4", value: "5" },
    { label: "6/4", value: "6" },
    { label: "7/4", value: "7" },
    { label: "5/8", value: "2.5" },
    { label: "7/8", value: "3.5" },
    { label: "9/8", value: "4.5" },
    { label: "11/8", value: "5.5" },
  ];

  const matchingTimeSignature = timeSignatureOptions.find(
    (option) => option.value === timeSignature.toString()
  );
  return matchingTimeSignature?.label.split("/");
};

export const Dashboard = () => {
  const { projects, deleteProject, getProjectById, quota } = useFileSystem();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      e.preventDefault();
      e.stopPropagation();
      deleteProject(id);
    }
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

  return (
    <div className="flex flex-col items-center lg:container p-1 mx-0 lg:mx-auto lg:py-6 h-screen w-full">
      <div className="max-w-[990px] h-[50px] w-full justify-between p-2 flex items-center ">
        <h2 className="text-2xl font-bold">Projects</h2>
        <span className="flex items-center gap-2">
          <Link to="/studio" className={newProjectBtnClassName}>
            New Project
          </Link>
          <Link to="/studio/DEMO" className={demoProjectBtnClassName}>
            Load Demo
          </Link>
        </span>
      </div>
      <div className="flex gap-4 w-full justify-between sm:justify-end px-2 py-1 max-w-[990px]">
        <span className="text-surface-6 text-xs lg:text-sm">
          Used: <strong>{`${quota?.used} `}</strong>/
          <strong>{` ${quota?.total}`}</strong>
        </span>

        <span className="text-surface-6 text-xs lg:text-sm">
          Available: <strong>{`${quota?.available} `}</strong>
        </span>
      </div>
      <Card className="max-w-[990px] h-[calc(100%-50px)] w-full">
        <CardContent className="h-full">
          <div className="h-full overflow-auto no-scrollbar ">
            {projects?.length ? (
              <Table className="h-full">
                <TableHeader>
                  <TableRow className="pointer-events-none">
                    <TableHead>Name</TableHead>
                    <TableHead>BPM</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Time Signature</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Modified</TableHead>

                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="h-full overflow-auto no-scrollbar">
                  {projects.map((project) => (
                    <TableRow
                      onClick={() => navigate({ to: `studio/${project.id}` })}
                      className="cursor-pointer h-[80px]"
                      key={project.id}
                    >
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>{project.bpm}</TableCell>
                      <TableCell>{project.key}</TableCell>
                      <TableCell>
                        <TimeSignatureIcon
                          upper={parseInt(
                            getTimeSignatureIconValues(
                              project.timeSignature
                            )?.[0] || ""
                          )}
                          lower={parseInt(
                            getTimeSignatureIconValues(
                              project.timeSignature
                            )?.[1] || ""
                          )}
                          className="h-8 w-8 lg:h-8 lg:w-8 text-surface-5 fill-current"
                        />
                      </TableCell>
                      <TableCell className="display-none lg:display-block text-muted-foreground">
                        {formatBytes(project.size)}
                      </TableCell>
                      <TableCell className="display-none lg:display-block text-muted-foreground">
                        {new Date(project.lastModified).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onMouseOver={(e) => e.stopPropagation()}
                            variant="outline"
                            size="icon"
                            className="border-0 bg-transparent h-full p-1"
                            onClick={(e) => handleDownload(e, project.id)}
                            aria-label={`Download ${project.name}`}
                          >
                            <GrDownload className="h-5 w-5" />
                          </Button>

                          <Button
                            onMouseOver={(e) => e.stopPropagation()}
                            variant="outline"
                            size="icon"
                            className="border-0 bg-transparent h-full p-1"
                            onClick={(e) => handleDelete(e, project.id)}
                            aria-label={`Delete ${project.name}`}
                          >
                            <DeleteIcon className="h-5 w-5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <span className="flex items-center mx-auto justify-center text-center text-surface-5 w-1/2 h-full flex-shrink-0">
                No projects found! Click 'New Project' to create one, or check
                out a demo by clicking 'Load Demo'.
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
