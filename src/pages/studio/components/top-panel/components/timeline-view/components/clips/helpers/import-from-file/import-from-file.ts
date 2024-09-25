import {
  Track,
  AudioClip,
  audioBufferCache,
} from "@/pages/studio/audio-engine/components";
import * as Tone from "tone";

export const importFromFile = async (activeTracks: Track[]) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".mp3, .wav"; // Accept only mp3 and wav files
  fileInput.style.display = "none"; // Keep it hidden

  // Append it to the document body (so it can be clicked)
  document.body.appendChild(fileInput);

  // Handle the file selection
  fileInput.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return; // If no file is selected, exit

    const start = Tone.Time(Tone.getTransport().seconds, "s").toSamples(); // Get start time in samples

    // Create a URL from the file
    const url = URL.createObjectURL(file);

    // Load the audio file into a ToneAudioBuffer
    const audioBuffer = await new Tone.ToneAudioBuffer().load(url);

    activeTracks.forEach((track) => {
      if (track.input === "mic") {
        const clip = new AudioClip({
          trackId: track.id,
          start,
        });

        audioBufferCache.add(clip.id, audioBuffer.toMono());
        clip.setBuffer(audioBuffer);

        clip.createWaveformCache(audioBuffer);

        track.createAudioClip(clip);
      } else if (track.input === "midi") {
        console.log("MIDI processing not supported in this function.");
      }
    });

    URL.revokeObjectURL(url);

    document.body.removeChild(fileInput);
  };

  fileInput.click();
};
