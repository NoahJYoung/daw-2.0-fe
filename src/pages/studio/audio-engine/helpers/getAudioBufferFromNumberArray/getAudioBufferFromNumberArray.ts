import * as Tone from "tone";

export const getAudioBufferFromNumberArray = (
  audioDataArray: number[] | number[][]
) => {
  const isStereo = Array.isArray(audioDataArray[0]);
  const audioContext = Tone.getContext();
  const sampleRate = audioContext.sampleRate;

  if (isStereo) {
    const leftChannelData = audioDataArray[0] as number[];
    const rightChannelData = audioDataArray[1] as number[];

    if (leftChannelData.length !== rightChannelData.length) {
      throw new Error("Left and right channel data must have the same length");
    }

    const audioBuffer = audioContext.createBuffer(
      2,
      leftChannelData.length,
      sampleRate
    );

    const leftChannel = audioBuffer.getChannelData(0);
    for (let i = 0; i < leftChannelData.length; i++) {
      leftChannel[i] = leftChannelData[i];
    }

    const rightChannel = audioBuffer.getChannelData(1);
    for (let i = 0; i < rightChannelData.length; i++) {
      rightChannel[i] = rightChannelData[i];
    }

    return audioBuffer;
  } else {
    const audioBuffer = audioContext.createBuffer(
      1,
      audioDataArray.length,
      sampleRate
    );

    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < audioDataArray.length; i++) {
      channelData[i] = audioDataArray[i] as number;
    }

    return audioBuffer;
  }
};
