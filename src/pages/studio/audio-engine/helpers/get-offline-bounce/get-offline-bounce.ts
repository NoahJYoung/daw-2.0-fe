import * as Tone from "tone";
import { AudioEngine } from "../../audio-engine";
import { generateOfflineSends } from "../generate-offline-sends";
import { clone } from "mobx-keystone";
import { bufferToWav } from "@/pages/studio/utils";

export const getOfflineBounce = async (audioEngine: AudioEngine) => {
  audioEngine.setLoadingState("Bouncing");
  const { sampleRate } = Tone.getContext();
  const duration = audioEngine.getBounceEndFromLastClip(sampleRate);

  const buffer = await Tone.Offline(() => {
    const clonedEngine = clone(audioEngine, { generateNewIds: false });
    generateOfflineSends(clonedEngine);
    clonedEngine.play();
  }, duration + 1);

  const wav = await bufferToWav(buffer, audioEngine.projectName);
  const link = document.createElement("a");
  link.href = URL.createObjectURL(wav);
  link.download = `${audioEngine.projectName}.wav`;
  link.click();

  URL.revokeObjectURL(link.href);
  audioEngine.setLoadingState(null);
};
