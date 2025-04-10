import { Link, useNavigate } from "@tanstack/react-router";
import { useFileSystem } from "@/hooks";
import { TimeSignatureIcon } from "../studio/components/main-controls/components/timeline-controls/components";
import { HiOutlineTrash as DeleteIcon } from "react-icons/hi";

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

const newProjectBtnClassName = `rounded-xs font-bold text-md focus-visible:ring-0 relative flex items-center gap-2 p-1 h-8 bg-surface-8 text-surface-0 hover:text-surface-8 hover:bg-surface-0 border border-surface-8 `;
const demoProjectBtnClassName = `rounded-xs font-bold text-md focus-visible:ring-0 relative flex items-center gap-2 p-1 h-8 bg-surface-0 border-surface-8 border text-surface-8 hover:text-surface-0 hover:border-surface-8 hover:bg-surface-8`;

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
  const { projects, deleteProject } = useFileSystem();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      e.preventDefault();
      e.stopPropagation();
      deleteProject(id);
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
      <Card className="max-w-[990px] h-[calc(100%-50px)] w-full">
        <CardContent className="h-full">
          <div className="h-full overflow-auto no-scrollbar">
            <Table className="h-full">
              <TableHeader>
                <TableRow className="pointer-events-none">
                  <TableHead>Name</TableHead>
                  <TableHead>BPM</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Time Signature</TableHead>
                  <TableHead className="display-none lg:display-block">
                    Modified
                  </TableHead>

                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="h-full overflow-auto no-scrollbar">
                {projects &&
                  projects.map((project) => (
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
                        {project.lastModified}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onMouseOver={(e) => e.stopPropagation()}
                            variant="outline"
                            size="icon"
                            className=" h-full p-1"
                            onClick={(e) => handleDelete(e, project.id)}
                            aria-label={`Delete ${project.name}`}
                          >
                            <DeleteIcon className="h-6 w-6 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
