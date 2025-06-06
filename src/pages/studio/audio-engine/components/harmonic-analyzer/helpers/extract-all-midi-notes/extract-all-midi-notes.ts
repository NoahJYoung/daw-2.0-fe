import { AudioClip } from "../../../audio-clip";
import { MidiClip } from "../../../midi-clip";
import { ProcessedNote, UseSelectedOptions } from "../../types";
import * as Tone from "tone";
import { Mixer } from "../../../mixer";
import { MidiNote } from "../../../midi-note";

const isPassingTone = (
  prevNote: MidiNote,
  currentNote: MidiNote,
  nextNote: MidiNote
): boolean => {
  const prevPitch = Tone.Midi(prevNote.note.join("")).valueOf();
  const currentPitch = Tone.Midi(currentNote.note.join("")).valueOf();
  const nextPitch = Tone.Midi(nextNote.note.join("")).valueOf();

  const isAscending = prevPitch < currentPitch && currentPitch < nextPitch;
  const isDescending = prevPitch > currentPitch && currentPitch > nextPitch;

  if (!isAscending && !isDescending) {
    return false;
  }

  const intervalToPrev = Math.abs(currentPitch - prevPitch);
  const intervalToNext = Math.abs(nextPitch - currentPitch);
  const isChromatic = intervalToPrev === 1 || intervalToNext === 1;
  const isStepwise = intervalToPrev === 2 || intervalToNext === 2;
  const overallInterval = Math.abs(nextPitch - prevPitch);
  const isActuallyPassing =
    overallInterval > Math.max(intervalToPrev, intervalToNext);

  return (isChromatic || isStepwise) && isActuallyPassing;
};

const filterPassingTones = (sortedNotes: MidiNote[]): MidiNote[] => {
  if (sortedNotes.length <= 2) {
    return sortedNotes;
  }

  const filteredNotes: MidiNote[] = [];

  for (let i = 0; i < sortedNotes.length; i++) {
    const currentNote = sortedNotes[i];

    if (i === 0 || i === sortedNotes.length - 1) {
      filteredNotes.push(currentNote);
      continue;
    }

    const prevNote = sortedNotes[i - 1];
    const nextNote = sortedNotes[i + 1];

    const isSequential =
      prevNote.off <= currentNote.on && currentNote.off <= nextNote.on;

    if (isSequential && isPassingTone(prevNote, currentNote, nextNote)) {
      continue;
    }

    filteredNotes.push(currentNote);
  }

  return filteredNotes;
};

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
      let clipNotes: MidiNote[] = [];

      if (clip.type === "audio") {
        const midiClip = clip as AudioClip;
        clipNotes = [...midiClip.midiNotes];
      } else {
        const midiClip = clip as MidiClip;
        clipNotes = [...midiClip.events];
      }

      const sortedClipNotes = clipNotes.sort((a, b) => {
        if (a.on === b.on) {
          return (
            Tone.Midi(a.note.join("")).valueOf() -
            Tone.Midi(b.note.join("")).valueOf()
          );
        }
        return a.on - b.on;
      });

      const filteredClipNotes = options?.filterPassingTones
        ? filterPassingTones(sortedClipNotes)
        : sortedClipNotes;

      for (const note of filteredClipNotes) {
        const absoluteStartTime = clip.start + note.on;
        const absoluteEndTime = clip.start + note.off;

        const newNote = {
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
        };

        allNotes.push(newNote);
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
