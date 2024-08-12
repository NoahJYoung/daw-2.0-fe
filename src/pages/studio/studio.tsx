import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function Studio() {
  const { projectId } = useParams();
  const { toast } = useToast();

  const testToast = () => {
    toast({ title: "Hello!", description: "Welcome to your new project" });
  };

  return (
    <>
      <Button onClick={testToast}>Click Me</Button>
      {projectId ? (
        <div>{`Project ID is: ${projectId}`}</div>
      ) : (
        <div>New Project</div>
      )}
    </>
  );
}
