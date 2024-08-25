import * as Tone from "tone";

export const getAudioBufferFromNumberArray = (
  audioDataArray: Float32Array | Float32Array[]
) => {
  const isStereo = Array.isArray(audioDataArray[0]);

  if (isStereo) {
    const [channel1, channel2] = audioDataArray;
    return new Tone.ToneAudioBuffer().fromArray([
      new Float32Array(channel1 as Float32Array),
      new Float32Array(channel2 as Float32Array),
    ]);
  } else {
    return new Tone.ToneAudioBuffer().fromArray(
      new Float32Array(audioDataArray as Float32Array)
    );
  }
};
