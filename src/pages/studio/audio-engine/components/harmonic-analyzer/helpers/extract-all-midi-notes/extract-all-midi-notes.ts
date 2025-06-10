import { AudioClip } from "../../../audio-clip";
import { MidiClip } from "../../../midi-clip";
import { ProcessedNote, MidiNoteExtractionOptions } from "../../types";
import * as Tone from "tone";
import { Mixer } from "../../../mixer";
import { MidiNote } from "../../../midi-note";

export interface PassingToneFilterOptions {
  filterChromatic?: boolean;
  filterStepwise?: boolean;
}

const isPassingTone = (
  prevNote: MidiNote,
  currentNote: MidiNote,
  nextNote: MidiNote,
  filterOptions?: PassingToneFilterOptions
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
  const overallInterval = Math.abs(nextPitch - prevPitch);

  const isActuallyPassing =
    overallInterval > Math.max(intervalToPrev, intervalToNext);

  if (!isActuallyPassing) {
    return false;
  }

  const isChromatic = intervalToPrev === 1 && intervalToNext === 1;
  const isStepwise = intervalToPrev === 2 || intervalToNext === 2;
  const isDiatonic =
    isStepwise ||
    (intervalToPrev === 1 && intervalToNext === 2) ||
    (intervalToPrev === 2 && intervalToNext === 1);

  if (!filterOptions) {
    return isChromatic || isStepwise;
  }

  const { filterChromatic = false, filterStepwise = false } = filterOptions;

  if (!filterChromatic && !filterStepwise) {
    return false;
  }

  if (filterChromatic && isChromatic) {
    console.log([prevNote, currentNote, nextNote], {
      intervalToPrev,
      intervalToNext,
      prevPitch,
      currentPitch,
      nextPitch,
    });
    return true;
  }

  if (filterStepwise && isDiatonic) {
    return true;
  }

  return false;
};

const filterPassingTones = (
  sortedNotes: MidiNote[],
  filterOptions?: PassingToneFilterOptions
): MidiNote[] => {
  if (sortedNotes.length <= 2) {
    return sortedNotes;
  }

  const filteredNotes: MidiNote[] = [];
  const indexesToSkip = new Set<number>();

  for (let i = 0; i < sortedNotes.length; i++) {
    if (indexesToSkip.has(i)) {
      continue;
    }
    const currentNote = sortedNotes[i];

    if (i === 0 || i === sortedNotes.length - 1) {
      filteredNotes.push(currentNote);
      continue;
    }

    const prevNote = sortedNotes[i - 1];
    const nextNote = sortedNotes[i + 1];

    const isSequential =
      prevNote.off <= currentNote.on && currentNote.off <= nextNote.on;

    if (
      isSequential &&
      isPassingTone(prevNote, currentNote, nextNote, filterOptions)
    ) {
      indexesToSkip.add(i + 1);
      continue;
    }

    filteredNotes.push(currentNote);
  }

  return filteredNotes;
};

export function extractAllMidiNotes(
  mixer: Mixer,
  options?: MidiNoteExtractionOptions
): ProcessedNote[] {
  const allNotes: ProcessedNote[] = [];

  let shouldFilter = false;
  let filterOptions: PassingToneFilterOptions | undefined;

  if (
    options?.filterChromaticPassingTones ||
    options?.filterDiatonicPassingTones
  ) {
    shouldFilter = true;
    filterOptions = {
      filterChromatic: options?.filterChromaticPassingTones,
      filterStepwise: options?.filterDiatonicPassingTones,
    };
  }

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

      const filteredClipNotes = shouldFilter
        ? filterPassingTones(sortedClipNotes, filterOptions)
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

  const notes = allNotes.sort((a, b) => {
    if (a.absoluteStartTime === b.absoluteStartTime) {
      return a.pitch - b.pitch;
    }
    return a.absoluteStartTime - b.absoluteStartTime;
  });

  console.log(shouldFilter, filterOptions, notes);

  return notes;
}
