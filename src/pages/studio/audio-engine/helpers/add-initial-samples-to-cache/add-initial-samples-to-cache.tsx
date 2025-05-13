import { audioBufferCache } from "../../components";
import { blobToAudioBuffer } from "../blob-to-audio-buffer";
import { unzipProjectFile } from "../unzip-project-file";
import * as Tone from "tone";
import { getSamplePacks } from "@/hooks/use-file-system/helpers";

export const addInitialSamplesToCache = async (
  uniqueSamplePathsToLoad: string[]
) => {
  await Promise.all(
    uniqueSamplePathsToLoad.map(async (path) => {
      if (path.startsWith("localSamples://")) {
        const root = await navigator.storage.getDirectory();

        const samplePacksDir = await root.getDirectoryHandle("sample-packs");
        const localSamplesPacks = await getSamplePacks(samplePacksDir);

        const splitPath = path.split("//")[1];

        const [packId] = splitPath.split("/");

        const samplePack = localSamplesPacks?.find(
          (pack) => pack.id === packId
        );

        if (samplePack) {
          const unzippedObject = await unzipProjectFile(samplePack.data);

          const samplesMap: Record<string, Tone.ToneAudioBuffer> = {};

          await Promise.all(
            Object.keys(unzippedObject).map(async (key) => {
              if (key !== "cover.png") {
                const audioBlob = unzippedObject[key];
                const audioBuffer = await blobToAudioBuffer(audioBlob);
                samplesMap[key] = audioBuffer;
              }
            })
          );
          audioBufferCache.addSamples({
            path: path,
            samples: samplesMap,
          });
        } else {
          throw new Error(
            `No Samples found for local pack with id: '${packId}'`
          );
        }
      } else {
        const response = await fetch(path);
        const blob = await response.blob();

        const file = new File([blob], path.split("/")[3] + ".zip", {
          type: "application/zip",
        });

        const unzippedObject = await unzipProjectFile(file);

        const audioFiles = Object.keys(unzippedObject).filter(
          (key) => key.endsWith(".wav") || key.endsWith(".mp3")
        );

        const samplesMap: Record<string, Tone.ToneAudioBuffer> = {};

        await Promise.all(
          audioFiles.map(async (fileName) => {
            const audioBlob = unzippedObject[fileName];
            const audioBuffer = await blobToAudioBuffer(audioBlob);

            const splitPath = fileName.replace(/\.(wav|mp3)$/i, "").split("/");
            const key = splitPath.length > 1 ? splitPath[1] : fileName;
            samplesMap[key] = audioBuffer;
          })
        );

        audioBufferCache.addSamples({
          path: path,
          samples: samplesMap,
        });
      }
    })
  );
};
