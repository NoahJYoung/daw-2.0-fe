import type { ProcessedNote } from "../../types";
import { getSamplesPerBeat } from "../get-samples-per-beat";

export function groupNotesByTimeWindows(
  notes: ProcessedNote[]
): ProcessedNote[][] {
  if (notes.length === 0) return [];

  const samplesPerQuarter = getSamplesPerBeat();
  const windows: ProcessedNote[][] = [];
  const maxTime = Math.max(...notes.map((n) => n.absoluteEndTime));

  for (let start = 0; start < maxTime; start += samplesPerQuarter) {
    const end = start + samplesPerQuarter;
    const windowNotes = notes.filter(
      (note) => note.absoluteStartTime < end && note.absoluteEndTime > start
    );

    if (windowNotes.length > 1) {
      const sortedNotes = windowNotes.sort((a, b) => a.pitch - b.pitch);
      windows.push(sortedNotes);
    }
  }

  return windows;
}
