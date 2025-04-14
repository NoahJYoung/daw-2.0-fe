/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from "jszip";
import { Project } from "../../use-file-system";

export const getProjects = async (
  directoryHandle: FileSystemDirectoryHandle | null
): Promise<Project[] | undefined> => {
  if (!directoryHandle) return;

  try {
    const projectsFound = [];

    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file") {
        try {
          const fileHandle = entry as FileSystemFileHandle;
          const file = await fileHandle.getFile();

          const zip = new JSZip();
          await zip.loadAsync(file);

          let metadata = {} as any;
          if ((zip as any).comment) {
            try {
              metadata = JSON.parse((zip as any).comment);
            } catch (e) {
              console.warn(`Failed to parse comment in ${file.name}:`, e);
            }
          }

          const projectObject = {
            data: file,
            name:
              metadata.projectName ||
              file.name.replace(/\.(velocity\.)?zip$/, ""),
            id: file.name.split(".")[1],
            lastModified: metadata.lastModified
              ? new Date(metadata.lastModified).toUTCString()
              : new Date(file.lastModified).toUTCString(),
            bpm: metadata.bpm,
            timeSignature: metadata.timeSignature,
            key: metadata.key,
            size: metadata.size || 0,
          };

          projectsFound.push(projectObject);
        } catch (err) {
          console.error(`Error processing file ${entry.name}:`, err);
        }
      }
    }

    projectsFound.sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    return projectsFound;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
};
