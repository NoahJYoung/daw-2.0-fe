import JSZip from "jszip";

export async function unzipProjectFile(file: File) {
  const unzipped = new JSZip();

  const arrayBuffer = await file.arrayBuffer();

  const zipContents = await unzipped.loadAsync(arrayBuffer);

  const extractedFiles: { [fileName: string]: Blob } = {};
  for (const fileName in zipContents.files) {
    const zipEntry = zipContents.files[fileName];
    if (!zipEntry.dir) {
      const fileData = await zipEntry.async("blob");
      extractedFiles[fileName] = fileData;
    }
  }

  return extractedFiles;
}
