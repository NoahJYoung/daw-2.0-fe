import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import * as Tone from "tone";
import { Badge } from "@/components/ui/badge";
import { RomanNumeralAnalysis } from "../../audio-engine/components/harmonic-analyzer/types";
import { observer } from "mobx-react-lite";
import { useAudioEngine, useUndoManager } from "../../hooks";
import { HarmonicAnalyzer } from "../../audio-engine/components";
import { EmptyAnalysis, Header, Measure } from "./components";
import { getQualityColor } from "./helpers";
import { AudioEngineState } from "../../audio-engine/types";

interface HarmonicAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HarmonicAnalysisModal = observer(
  ({ isOpen, onClose }: HarmonicAnalysisModalProps) => {
    const { undoManager } = useUndoManager();
    const [currentChordIndex, setCurrentChordIndex] = useState<number | null>(
      null
    );
    const audioEngine = useAudioEngine();
    const [analysis, setAnalysis] = useState<RomanNumeralAnalysis[][]>([]);

    const { mixer, timeline } = audioEngine;
    const isPlaying = audioEngine.state === AudioEngineState.playing;

    useEffect(() => {
      if (isOpen) {
        const useSelected = mixer.selectedTracks.length > 0;
        const analyzer = new HarmonicAnalyzer(mixer, timeline);

        try {
          const analysis = analyzer.getRomanNumeralAnalysis({
            useSelectedTracksOnly: useSelected,
          });
          setAnalysis(analysis);
        } catch (error) {
          console.error(error);
        }
      } else {
        setAnalysis([]);
      }
    }, [mixer, timeline, isOpen]);

    const play = useCallback(() => {
      undoManager.withoutUndo(() => {
        audioEngine.play();
      });
    }, [audioEngine, undoManager]);

    const stop = useCallback(() => {
      undoManager.withoutUndo(() => {
        audioEngine.stop();
      });
    }, [audioEngine, undoManager]);

    const pause = useCallback(() => {
      undoManager.withoutUndo(() => {
        audioEngine.pause();
      });
    }, [audioEngine, undoManager]);

    const flatAnalysis = analysis.flat();

    useEffect(() => {
      let intervalId: NodeJS.Timeout | null = null;

      if (isPlaying && flatAnalysis.length > 0) {
        const sixteenthNoteInMilliseconds = Tone.Time("16n").toMilliseconds();

        intervalId = setInterval(() => {
          const transportPositionInSeconds = Tone.getTransport().seconds;
          const barsBeatsSixteenths = Tone.Time(
            transportPositionInSeconds
          ).toBarsBeatsSixteenths();

          const [bars, beats] = barsBeatsSixteenths.split(":").map(Number);

          const currentMeasure = bars;
          const currentBeat = beats + 1;

          const lastChord = flatAnalysis[flatAnalysis.length - 1];
          if (currentMeasure > lastChord.measure) {
            setCurrentChordIndex(null);
            return;
          }

          const currentChordIdx = flatAnalysis.findIndex((chord, index) => {
            const chordMeasure = chord.measure;
            const chordBeat = chord.beat;

            const nextChord = flatAnalysis[index + 1];

            if (!nextChord) {
              return (
                currentMeasure === chordMeasure && currentBeat >= chordBeat
              );
            }

            if (currentMeasure === chordMeasure) {
              return (
                currentBeat >= chordBeat &&
                (nextChord.measure > chordMeasure ||
                  (nextChord.measure === chordMeasure &&
                    currentBeat < nextChord.beat))
              );
            } else if (
              currentMeasure > chordMeasure &&
              currentMeasure < nextChord.measure
            ) {
              return true;
            } else if (
              currentMeasure === nextChord.measure &&
              nextChord.beat > 1
            ) {
              return currentBeat < nextChord.beat;
            }

            return false;
          });

          if (currentChordIdx !== -1 && currentChordIdx !== currentChordIndex) {
            setCurrentChordIndex(currentChordIdx);
          }
        }, sixteenthNoteInMilliseconds);
      }

      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    }, [isPlaying, flatAnalysis, currentChordIndex]);

    useEffect(() => {
      if (
        isPlaying &&
        typeof currentChordIndex === "number" &&
        flatAnalysis.length > 0
      ) {
        const currentChord = flatAnalysis[currentChordIndex];
        if (currentChord) {
          const chordElement = document.querySelector(
            `[data-chord-id="${currentChord.measure}-${currentChord.beat}-${currentChord.chordSymbol}"]`
          );

          if (chordElement) {
            chordElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });
          }
        }
      }
    }, [currentChordIndex, isPlaying, flatAnalysis]);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-screen lg:max-h-[95vh] overflow-hidden gap-1 p-0">
          <Header
            trackCount={mixer.selectedTracks.length}
            totalTracks={mixer.tracks.length}
            playbackState={audioEngine.state}
            onPause={pause}
            onPlay={play}
            onStop={stop}
            analysis={analysis}
          />

          {analysis.length === 0 ? (
            <EmptyAnalysis
              isSelectedTracksEmpty={mixer.selectedTracks.length === 0}
            />
          ) : (
            <div className="space-y-3 sm:space-y-6 overflow-y-auto no-scrollbar max-h-full">
              <div className="relative">
                <div className="grid py-2 px-2 md:px-8 gap-6 sm:gap-4">
                  {analysis.map((measureChords, measureIndex) => (
                    <Measure
                      chords={measureChords}
                      measureIndex={measureIndex}
                      currentChordIndex={currentChordIndex}
                      timeline={timeline}
                      flatAnalysis={flatAnalysis}
                      isPlaying={isPlaying}
                    />
                  ))}
                </div>
              </div>

              {isPlaying && typeof currentChordIndex === "number" && (
                <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-700 p-2 sm:p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Now Playing:
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl font-bold font-mono text-brand-1">
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
          )}
        </DialogContent>
      </Dialog>
    );
  }
);
