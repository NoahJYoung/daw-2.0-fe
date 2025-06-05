import { useState, useEffect } from "react";
import * as Tonal from "tonal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Music, Info } from "lucide-react";
import { RomanNumeralAnalysis } from "../../audio-engine/components/harmonic-analyzer/types";
import { observer } from "mobx-react-lite";
import { useAudioEngine } from "../../hooks";
import { HarmonicAnalyzer } from "../../audio-engine/components";

const getQualityColor = (quality: string): string => {
  switch (quality) {
    case "major":
      return "bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200";
    case "minor":
      return "bg-zinc-200 border-zinc-400 text-zinc-900 dark:bg-zinc-700 dark:border-zinc-500 dark:text-zinc-100";
    case "dominant":
      return "bg-zinc-300 border-zinc-500 text-zinc-900 dark:bg-zinc-600 dark:border-zinc-400 dark:text-zinc-100";
    case "diminished":
      return "bg-zinc-400 border-zinc-600 text-white dark:bg-zinc-500 dark:border-zinc-300 dark:text-zinc-100";
    default:
      return "bg-zinc-100 border-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-300";
  }
};

const getChordNotes = (chordAnalysis: RomanNumeralAnalysis) => {
  return Tonal.Chord.notes(chordAnalysis.tonalChordSymbol);
};

interface HarmonicAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HarmonicAnalysisModal = observer(
  ({ isOpen, onClose }: HarmonicAnalysisModalProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentChordIndex, setCurrentChordIndex] = useState(0);
    const [isLandscape, setIsLandscape] = useState(false);
    const { mixer, timeline } = useAudioEngine();
    const [analysis, setAnalysis] = useState<RomanNumeralAnalysis[][]>([]);

    const useSelected = mixer.selectedTracks.length > 0;

    useEffect(() => {
      const analyzer = new HarmonicAnalyzer(mixer, timeline);

      try {
        const analysis = analyzer.getRomanNumeralAnalysis({
          useSelectedTracksOnly: useSelected,
        });
        setAnalysis(analysis);
      } catch (error) {
        console.warn(error);
      }
    }, [mixer, timeline, useSelected]);

    useEffect(() => {
      const checkOrientation = () => {
        setIsLandscape(
          window.matchMedia("(orientation: landscape) and (max-height: 500px)")
            .matches
        );
      };

      checkOrientation();
      window.addEventListener("resize", checkOrientation);
      return () => window.removeEventListener("resize", checkOrientation);
    }, []);

    const togglePlayback = () => {
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        setCurrentChordIndex(0);
      }
    };

    const flatAnalysis = analysis.flat();

    const getChordDuration = (
      chordsInMeasure: RomanNumeralAnalysis[],
      currentChordIndex: number
    ): number => {
      const currentChord = chordsInMeasure[currentChordIndex];
      const nextChord = chordsInMeasure[currentChordIndex + 1];

      if (nextChord) {
        return nextChord.beat - currentChord.beat;
      } else {
        // Last chord in measure - duration until end of measure
        return timeline.timeSignature + 1 - currentChord.beat;
      }
    };

    const getChordStartPosition = (chord: RomanNumeralAnalysis): number => {
      return chord.beat - 1; // Convert to 0-based index
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-3 sm:p-6">
          <DialogHeader className="pb-2 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100">
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-zinc-900" />
                </div>
                <DialogTitle className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Harmonic Analysis
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Badge
                  variant="outline"
                  className="text-xs sm:text-sm border-zinc-300 dark:border-zinc-600"
                >
                  Key: {analysis[0]?.[0]?.key || "C major"}
                </Badge>
                <Button
                  onClick={togglePlayback}
                  variant={isPlaying ? "default" : "outline"}
                  size="sm"
                  className={`gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 ${
                    isPlaying
                      ? "bg-[hsl(341,98%,60%)] hover:bg-[hsl(341,98%,55%)] text-white border-[hsl(341,98%,60%)]"
                      : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
            {/* Timeline Overview */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2 sm:mb-4">
                <div className="w-2 h-2 rounded-full bg-[hsl(341,98%,60%)]"></div>
                <h3 className="font-semibold text-sm sm:text-lg text-zinc-900 dark:text-zinc-100">
                  Chord Progression Timeline
                </h3>
              </div>

              <div className="grid py-2 px-12 gap-6 sm:gap-4">
                {analysis.map((measureChords, measureIndex) => (
                  <div key={measureIndex} className="relative">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-3">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                      >
                        M{measureChords[0]?.measure || measureIndex + 1}
                      </Badge>
                      <div className="h-px bg-zinc-300 dark:bg-zinc-600 flex-1"></div>
                    </div>

                    <div
                      className="relative py-2 px-4"
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${timeline.timeSignature}, 1fr)`,
                        gap: "8px",
                        minHeight: isLandscape ? "60px" : "120px",
                      }}
                    >
                      {measureChords.map((chord, chordIndex) => {
                        const globalIndex = flatAnalysis.findIndex(
                          (c) =>
                            c.measure === chord.measure &&
                            c.beat === chord.beat &&
                            c.chordSymbol === chord.chordSymbol
                        );
                        const isCurrentChord =
                          isPlaying && globalIndex === currentChordIndex;

                        const startPosition = getChordStartPosition(chord);
                        const duration = getChordDuration(
                          measureChords,
                          chordIndex
                        );

                        return (
                          <Popover
                            key={`${chord.measure}-${chord.beat}-${chordIndex}`}
                          >
                            <PopoverTrigger asChild>
                              <Card
                                className={`cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                                  isCurrentChord
                                    ? "ring-2 ring-[hsl(341,98%,60%)] ring-offset-2 shadow-lg shadow-[hsl(341,98%,60%)]/25 scale-105 border-[hsl(341,98%,60%)]"
                                    : "hover:shadow-md border-zinc-200 dark:border-zinc-700"
                                } ${getQualityColor(chord.quality)}`}
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
                                    // Landscape mobile view - compact layout
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
                                        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(341,98%,60%)] animate-pulse"></div>
                                      )}
                                    </div>
                                  ) : (
                                    // Regular view
                                    <div className="space-y-1 sm:space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Badge
                                          variant="outline"
                                          className="text-xs font-mono border-zinc-400 dark:border-zinc-500"
                                        >
                                          B{chord.beat}
                                        </Badge>
                                        {isCurrentChord && (
                                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[hsl(341,98%,60%)] animate-pulse"></div>
                                        )}
                                      </div>
                                      <div className="flex sm:hidden items-center justify-between gap-2">
                                        <div className="text-lg font-bold font-mono">
                                          {chord.romanNumeral}
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-medium">
                                            {chord.chordSymbol}
                                          </div>
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
                                  <Info className="w-4 h-4 text-[hsl(341,98%,60%)]" />
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
                                    <div className="text-zinc-900 dark:text-zinc-100">
                                      {chord.root}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium text-muted-foreground text-xs">
                                      Quality
                                    </div>
                                    <Badge
                                      className={getQualityColor(chord.quality)}
                                    >
                                      {chord.quality}
                                    </Badge>
                                  </div>
                                  <div>
                                    <div className="font-medium text-muted-foreground text-xs">
                                      Duration
                                    </div>
                                    <div className="text-zinc-900 dark:text-zinc-100">
                                      {getChordDuration(
                                        measureChords,
                                        chordIndex
                                      )}{" "}
                                      beats
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
                                    Measure {chord.measure}, Beat {chord.beat} •
                                    Key: {chord.key}
                                  </div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isPlaying && (
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-700 p-2 sm:p-4 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Now Playing:
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-[hsl(341,98%,60%)]">
                      {flatAnalysis[currentChordIndex]?.romanNumeral}
                    </div>
                    <div className="text-base sm:text-lg font-medium text-zinc-900 dark:text-zinc-100">
                      {flatAnalysis[currentChordIndex]?.chordSymbol}
                    </div>
                    <Badge
                      className={getQualityColor(
                        flatAnalysis[currentChordIndex]?.quality || ""
                      )}
                    >
                      {flatAnalysis[currentChordIndex]?.quality}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
