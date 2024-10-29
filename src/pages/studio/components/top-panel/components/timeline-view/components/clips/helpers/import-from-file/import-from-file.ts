import {
  Track,
  AudioClip,
  audioBufferCache,
} from "@/pages/studio/audio-engine/components";
import * as Tone from "tone";

export const importFromFile = async (activeTracks: Track[]) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "audio/*";
  fileInput.style.display = "none";

  document.body.appendChild(fileInput);

  fileInput.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const start = Tone.Time(Tone.getTransport().seconds, "s").toSamples();

    const url = URL.createObjectURL(file);

    const audioBuffer = await new Tone.ToneAudioBuffer().load(url);

    activeTracks.forEach((track) => {
      const clip = new AudioClip({
        trackId: track.id,
        start,
      });

      audioBufferCache.add(clip.id, audioBuffer.toMono());
      clip.setBuffer(audioBuffer);

      clip.createWaveformCache(audioBuffer);

      track.createAudioClip(clip);
    });

    URL.revokeObjectURL(url);

    document.body.removeChild(fileInput);
  };

  fileInput.click();
};
