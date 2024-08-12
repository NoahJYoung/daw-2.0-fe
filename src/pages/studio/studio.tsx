import { useParams } from "react-router-dom";

export function Studio() {
  const { projectId } = useParams();

  return (
    <>
      {projectId ? (
        <div>{`Project ID is: ${projectId}`}</div>
      ) : (
        <div>New Project</div>
      )}
    </>
  );
}
