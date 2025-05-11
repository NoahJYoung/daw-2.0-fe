import { audioBufferCache } from "../../components";
import { blobToAudioBuffer } from "../blob-to-audio-buffer";
import { unzipProjectFile } from "../unzip-project-file";
import * as Tone from "tone";

export const addInitialSamplesToCache = async (
  uniqueSamplePathsToLoad: string[]
) => {
  await Promise.all(
    uniqueSamplePathsToLoad.map(async (path) => {
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
    })
  );
};
