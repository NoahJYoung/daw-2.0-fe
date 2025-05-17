/* eslint-disable @typescript-eslint/no-explicit-any */
import JSZip from "jszip";
import { SamplePack } from "../../use-file-system";

export const getSamplePacks = async (
  directoryHandle: FileSystemDirectoryHandle | null
): Promise<SamplePack[] | undefined> => {
  if (!directoryHandle) return;

  try {
    const packsFound = [];

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

          const samplePackObject = {
            data: file,
            name:
              metadata.packName ||
              file.name?.replace(/\.(velocity\.)?zip$/, ""),
            id: file.name.split(".")[1],
            totalSamples: metadata.totalSamples || 0,
            description: metadata.description || "",
            lastModified: metadata.lastModified
              ? new Date(metadata.lastModified).toUTCString()
              : new Date(file.lastModified).toUTCString(),
            size: metadata.size || 0,
          };

          packsFound.push(samplePackObject);
        } catch (err) {
          console.error(`Error processing file ${entry.name}:`, err);
        }
      }
    }

    packsFound.sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    return packsFound;
  } catch (err) {
    console.error("Error reading directory:", err);
    throw err;
  }
};
