import { AxiosInstance } from "axios";
import {
  blobToAudioBuffer,
  unzipProjectFile,
} from "@/pages/studio/audio-engine/helpers";
import { audioBufferCache } from "../audio-engine/components";
import { reverbBufferKeys } from "../audio-engine/components/effects/reverb";

const fetchReverbs = async (api: AxiosInstance) => {
  try {
    const presignedUrl = await api.get<{ url: string }>(
      "/storage/common-resource?filePath=reverbs/reverbs.zip"
    );
    const { data } = presignedUrl;
    const { url } = data;
    if (url) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error fetching from signed url: " + url);
      }
      return response as unknown as File;
    }
  } catch (error) {
    console.error(error);
  }
};

export const addReverbsToAudioBufferCache = async (api: AxiosInstance) => {
  if (!reverbBufferKeys.every((key) => audioBufferCache.has(key))) {
    const reverbFilesZip = await fetchReverbs(api);
    if (reverbFilesZip) {
      const blobObject = await unzipProjectFile(reverbFilesZip);

      const decodeBufferPromises = reverbBufferKeys.map((key) =>
        blobToAudioBuffer(blobObject[key])
      );
      const decodedBuffers = await Promise.all(decodeBufferPromises);
      reverbBufferKeys.forEach((key, i) =>
        audioBufferCache.add(key, decodedBuffers[i])
      );
    }
  }
};
