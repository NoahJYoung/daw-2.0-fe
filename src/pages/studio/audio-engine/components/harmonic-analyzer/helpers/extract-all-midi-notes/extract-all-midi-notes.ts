import { AudioClip } from "../../../audio-clip";
import { MidiClip } from "../../../midi-clip";
import { ProcessedNote, UseSelectedOptions } from "../../types";
import * as Tone from "tone";
import { Mixer } from "../../../mixer";

export function extractAllMidiNotes(
  mixer: Mixer,
  options?: UseSelectedOptions
): ProcessedNote[] {
  const allNotes: ProcessedNote[] = [];

  const tracksToUse = options?.useSelectedTracksOnly
    ? mixer.selectedTracks
    : mixer.tracks;

  for (const track of tracksToUse) {
    for (const clip of track.clips) {
      if (clip.type === "audio") {
        const midiClip = clip as AudioClip;
        for (const note of midiClip.midiNotes) {
          const absoluteStartTime = midiClip.start + note.on;
          const absoluteEndTime = midiClip.start + note.off;

          allNotes.push({
            absoluteStartTime: Tone.Time(
              Tone.Time(absoluteStartTime, "samples").quantize("16n"),
              "s"
            ).toSamples(),
            absoluteEndTime: Tone.Time(
              Tone.Time(absoluteEndTime, "samples").quantize("16n"),
              "s"
            ).toSamples(),
            pitch: Tone.Midi(note.note.join("")).valueOf(),
            velocity: note.velocity,
            duration: absoluteEndTime - absoluteStartTime,
          });
        }
      } else {
        const midiClip = clip as MidiClip;
        for (const note of midiClip.events) {
          const absoluteStartTime = midiClip.start + note.on;
          const absoluteEndTime = midiClip.start + note.off;

          allNotes.push({
            absoluteStartTime: Tone.Time(
              Tone.Time(absoluteStartTime, "samples").quantize("16n"),
              "s"
            ).toSamples(),
            absoluteEndTime: Tone.Time(
              Tone.Time(absoluteEndTime, "samples").quantize("16n"),
              "s"
            ).toSamples(),
            pitch: Tone.Midi(note.note.join("")).valueOf(),
            velocity: note.velocity,
            duration: absoluteEndTime - absoluteStartTime,
          });
        }
      }
    }
  }

  return allNotes.sort((a, b) => {
    if (a.absoluteStartTime === b.absoluteStartTime) {
      return a.pitch - b.pitch;
    }
    return a.absoluteStartTime - b.absoluteStartTime;
  });
}
