import audioBufferToWav from "audiobuffer-to-wav";
import { ToneAudioBuffer } from "tone";

export const bufferToWav = (
  buffer: ToneAudioBuffer,
  filename: string
): Promise<File> => {
  return new Promise((resolve) => {
    const rawBuffer = buffer.get();
    if (rawBuffer) {
      const blob = new Blob([audioBufferToWav(rawBuffer)], {
        type: "audio/wav",
      });
      resolve(new File([blob], filename, { type: "audio/wav" }));
      return blob;
    } else {
      throw new Error("Unable to convert buffer to blob");
    }
  });
};
