import { audioBufferCache } from "../../components";
import { blobToAudioBuffer } from "../blob-to-audio-buffer";

export const populateBufferCache = async (data: {
  [filename: string]: Blob;
}) => {
  audioBufferCache.clear();
  const audioClipKeys = Object.keys(data).filter(
    (key) => key !== "settings.json"
  );

  const audioBufferPromises = audioClipKeys.map(async (key) => {
    if (key !== "settings.json") {
      const blob = data[key];

      const buffer = await blobToAudioBuffer(blob);
      return { id: key, buffer };
    }
  });

  const bufferItems = await Promise.all(audioBufferPromises);

  bufferItems.forEach((bufferObject) => {
    if (bufferObject?.id && bufferObject?.buffer) {
      audioBufferCache.add(bufferObject.id, bufferObject.buffer);
    }
  });
};
