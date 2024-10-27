import * as lamejs from "@breezystack/lamejs";
import * as Tone from "tone";

export const audioBufferToMp3 = async (
  audioBuffer: Tone.ToneAudioBuffer,
  filename = "output.mp3"
): Promise<File> => {
  return new Promise((resolve) => {
    const leftChannel = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const mp3Encoder = new lamejs.Mp3Encoder(2, sampleRate, 128);
    const mp3Data = [];

    const convertBuffer = (input: Float32Array): Int16Array => {
      const output = new Int16Array(input.length);
      for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      return output;
    };

    const leftChannelInt16 = convertBuffer(leftChannel);

    const blockSize = 1152;
    for (let i = 0; i < leftChannelInt16.length; i += blockSize) {
      const leftChunk = leftChannelInt16.subarray(i, i + blockSize);
      const mp3buf = mp3Encoder.encodeBuffer(leftChunk, new Int16Array());
      if (mp3buf.length > 0) {
        mp3Data.push(new Int8Array(mp3buf));
      }
    }

    const mp3End = mp3Encoder.flush();
    if (mp3End.length > 0) {
      mp3Data.push(new Int8Array(mp3End));
    }

    const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
    resolve(new File([mp3Blob], filename, { type: "audio/mp3" }));
  });
};
