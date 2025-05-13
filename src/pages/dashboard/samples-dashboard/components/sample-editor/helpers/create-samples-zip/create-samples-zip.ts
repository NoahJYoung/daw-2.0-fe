import JSZip from "jszip";

export type SampleData = {
  file: File | null;
  name: string;
};

export type SampleMap = {
  [key: string]: SampleData;
};
export const createSamplesZip = async (
  packName: string,
  description: string,
  samples: SampleMap,
  cover: File | null
) => {
  let totalFileSize = 0;
  let totalSamples = 0;
  console.log("Creating zip file with samples", samples);
  const zip = new JSZip();
  Object.keys(samples).forEach((key) => {
    const file = samples[key].file;
    if (file) {
      zip.file(key, file);
      totalFileSize += file.size;
      totalSamples += 1;
    }
  });
  if (cover) {
    zip.file("cover.png", cover);
    totalFileSize += cover.size;
  }

  const metadata = JSON.stringify({
    packName,
    lastModified: new Date().toISOString(),
    size: totalFileSize,
    totalSamples,
    description,
  });

  const zipBlob = await zip.generateAsync({
    type: "blob",
    comment: metadata,
  });

  return zipBlob;
};
