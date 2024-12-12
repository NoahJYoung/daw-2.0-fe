import { AxiosInstance } from "axios";
import { addReverbsToAudioBufferCache } from "./add-reverbs-to-buffer-cache";

export const initBufferCache = async (api: AxiosInstance) => {
  await addReverbsToAudioBufferCache(api);
};
