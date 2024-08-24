import * as Tone from "tone";

export const getAudioBufferFromNumberArray = (
  audioDataArray: number[] | number[][]
) => {
  const isStereo = Array.isArray(audioDataArray[0]);

  if (isStereo) {
    const [channel1, channel2] = audioDataArray;
    return new Tone.ToneAudioBuffer().fromArray([
      new Float32Array(channel1 as number[]),
      new Float32Array(channel2 as number[]),
    ]);
  } else {
    return new Tone.ToneAudioBuffer().fromArray(
      new Float32Array(audioDataArray as number[])
    );
  }
};
