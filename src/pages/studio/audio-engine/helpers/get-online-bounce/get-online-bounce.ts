import * as Tone from "tone";
import { AudioEngine } from "../../audio-engine";
import { bufferToWav } from "@/pages/studio/utils";

export const getOnlineBounce = async (audioEngine: AudioEngine) => {
  const originalPlay = audioEngine.play;

  try {
    audioEngine.setLoadingState("Bouncing");
    audioEngine.play = async () => {
      return;
    };

    audioEngine.stop();

    const { sampleRate } = Tone.getContext();
    const durationInSeconds = audioEngine.getBounceEndFromLastClip(sampleRate);
    const recorder = new Tone.Recorder();
    Tone.getDestination().connect(recorder);
    recorder.start();

    audioEngine.play = originalPlay;

    await originalPlay.call(audioEngine);

    audioEngine.play = async () => {
      return;
    };

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        audioEngine.pause();
        resolve();
      }, durationInSeconds * 1000);
    });

    const recording = await recorder.stop();
    const url = URL.createObjectURL(recording);
    const audioBuffer = await new Tone.ToneAudioBuffer().load(url);
    const wav = await bufferToWav(
      audioBuffer,
      `${audioEngine.projectName}.wav`
    );

    const blobUrl = URL.createObjectURL(wav);
    const anchor = document.createElement("a");
    anchor.download = `${audioEngine.projectName}.wav`;
    anchor.href = blobUrl;
    anchor.click();

    Tone.getDestination().disconnect(recorder);
  } catch (error) {
    console.error("Error during bounce:", error);
  } finally {
    audioEngine.play = originalPlay;
    audioEngine.setLoadingState(null);
  }
};
