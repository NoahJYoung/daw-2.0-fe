import { Badge } from "@/components/ui/badge";

import { Timeline } from "@/pages/studio/audio-engine/components";
import { RomanNumeralAnalysis } from "@/pages/studio/audio-engine/components/harmonic-analyzer/types";
import { getChordStartPosition, getChordDuration } from "../../helpers";
import { ChordCard } from "./components";
import { isMobileDevice } from "@/pages/studio/utils";

interface MeasureProps {
  timeline: Timeline;
  measureIndex: number;
  chords: RomanNumeralAnalysis[];
  flatAnalysis: RomanNumeralAnalysis[];
  isPlaying: boolean;
  currentChordIndex: number | null;
}

export const Measure = ({
  timeline,
  measureIndex,
  chords,
  flatAnalysis,
  isPlaying,
  currentChordIndex,
}: MeasureProps) => (
  <div key={measureIndex} className="relative">
    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-3">
      <Badge
        variant="secondary"
        className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
      >
        M{chords[0]?.measure || measureIndex}
      </Badge>
      <div className="h-px bg-zinc-300 dark:bg-zinc-600 flex-1"></div>
    </div>

    <div
      className="relative py-2 px-4"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${timeline.timeSignature}, 1fr)`,
        gap: "8px",
        minHeight: isMobileDevice() ? "60px" : "120px",
      }}
    >
      {chords.map((chord, chordIndex) => {
        const globalIndex = flatAnalysis.findIndex(
          (c) =>
            c.measure === chord.measure &&
            c.beat === chord.beat &&
            c.chordSymbol === chord.chordSymbol
        );
        const isCurrentChord = isPlaying && globalIndex === currentChordIndex;

        const startPosition = getChordStartPosition(chord);
        const duration = getChordDuration(timeline, chords, chordIndex);

        return (
          <ChordCard
            isCurrentChord={isCurrentChord}
            duration={duration}
            startPosition={startPosition}
            timeline={timeline}
            chord={chord}
            chordIndex={chordIndex}
            chords={chords}
          />
        );
      })}
    </div>
  </div>
);
