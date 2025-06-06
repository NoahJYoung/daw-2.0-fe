import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import {
  getQualityColor,
  getChordDuration,
  getChordNotes,
} from "../../../../helpers";
import { RomanNumeralAnalysis } from "@/pages/studio/audio-engine/components/harmonic-analyzer/types";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/pages/studio/audio-engine/components";
import { cn } from "@/lib/utils";

interface ChardCardProps {
  chord: RomanNumeralAnalysis;
  chords: RomanNumeralAnalysis[];
  chordIndex: number;
  isCurrentChord: boolean;
  startPosition: number;
  duration: number;
  isLandscape: boolean;
  timeline: Timeline;
}

export const ChordCard = ({
  chord,
  chords,
  timeline,
  chordIndex,
  isCurrentChord,
  startPosition,
  duration,
  isLandscape,
}: ChardCardProps) => (
  <Popover key={`${chord.measure}-${chord.beat}-${chordIndex}`}>
    <PopoverTrigger asChild>
      <Card
        data-chord-id={`${chord.measure}-${chord.beat}-${chord.chordSymbol}`}
        className={cn(
          "cursor-pointer transition-all duration-300 hover:scale-105",
          {
            "ring-offset-2 scale-105 border-2 border-brand-1": isCurrentChord,
            "border-2 hover:shadow-md border-zinc-200 dark:border-zinc-700":
              !isCurrentChord,
          },
          getQualityColor(chord.quality)
        )}
        style={{
          gridColumnStart: startPosition + 1,
          gridColumnEnd: startPosition + duration + 1,
          minHeight: isLandscape ? "50px" : "100px",
        }}
      >
        <CardContent
          className={`p-2 h-full flex flex-col justify-center ${!isLandscape && "sm:p-4"}`}
        >
          {isLandscape ? (
            <div className="flex flex-col items-center justify-center h-full space-y-1">
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-zinc-400 dark:border-zinc-500 px-1"
              >
                {chord.beat}
              </Badge>
              <div className="text-sm font-bold font-mono">
                {chord.romanNumeral}
              </div>
              <div className="text-xs font-medium text-center">
                {chord.chordSymbol}
              </div>
              {isCurrentChord && (
                <div className="w-6 h-6 rounded-full bg-brand-1 animate-pulse"></div>
              )}
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-zinc-400 dark:border-zinc-500"
                >
                  B{chord.beat}
                </Badge>
                {isCurrentChord && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand-1 animate-pulse"></div>
                )}
              </div>
              <div className="flex sm:hidden items-center justify-between gap-2">
                <div className="text-lg font-bold font-mono">
                  {chord.romanNumeral}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{chord.chordSymbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {chord.root} {chord.quality}
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-center space-y-0.5 sm:space-y-1">
                <div className="text-lg sm:text-2xl font-bold font-mono">
                  {chord.romanNumeral}
                </div>
                <div className="text-xs sm:text-sm font-medium">
                  {chord.chordSymbol}
                </div>
                <div className="text-xs text-muted-foreground">
                  {chord.root} {chord.quality}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PopoverTrigger>
    <PopoverContent className="w-72 sm:w-80" side="top">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-1" />
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Chord Details
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <div className="font-medium text-muted-foreground text-xs">
              Roman Numeral
            </div>
            <div className="font-mono text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
              {chord.romanNumeral}
            </div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground text-xs">
              Chord Symbol
            </div>
            <div className="font-mono text-zinc-900 dark:text-zinc-100">
              {chord.chordSymbol}
            </div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground text-xs">
              Root Note
            </div>
            <div className="text-zinc-900 dark:text-zinc-100">{chord.root}</div>
          </div>
          <div>
            <div className="font-medium text-muted-foreground text-xs">
              Quality
            </div>
            <Badge className={getQualityColor(chord.quality)}>
              {chord.quality}
            </Badge>
          </div>
          <div>
            <div className="font-medium text-muted-foreground text-xs">
              Duration
            </div>
            <div className="text-zinc-900 dark:text-zinc-100">
              {getChordDuration(timeline, chords, chordIndex)} beats
            </div>
          </div>
        </div>

        {chord.chordScale && (
          <div>
            <div className="font-medium text-muted-foreground mb-1 text-xs">
              Chord Scale
            </div>
            <div className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-zinc-900 dark:text-zinc-100">
              {chord.chordScale}
            </div>
          </div>
        )}

        <div>
          <div className="font-medium text-muted-foreground mb-2 text-xs">
            Chord Notes
          </div>
          <div className="flex flex-wrap gap-1">
            {getChordNotes(chord).map((note, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
              >
                {note}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-muted-foreground">
            Measure {chord.measure}, Beat {chord.beat} • Key: {chord.key}
          </div>
        </div>
      </div>
    </PopoverContent>
  </Popover>
);
