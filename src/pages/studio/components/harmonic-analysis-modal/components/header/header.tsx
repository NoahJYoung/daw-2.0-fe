import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RomanNumeralAnalysis } from "@/pages/studio/audio-engine/components/harmonic-analyzer/types";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { Music, Pause, Play, Square } from "lucide-react";

interface HeaderProps {
  analysis: RomanNumeralAnalysis[][];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  playbackState: AudioEngineState;
}

export const Header = ({
  analysis,
  onPlay,
  onPause,
  onStop,
  playbackState,
}: HeaderProps) => (
  <DialogHeader className="pb-2 px-8 pt-4 pb-2 justify-center">
    <div className="flex flex-row items-start items-center justify-between gap-2 sm:gap-3">
      <div className="flex items-center sm:gap-3">
        <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 dark:bg-zinc-100">
          <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-zinc-900" />
        </div>
        <DialogTitle className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Harmonic Analysis
        </DialogTitle>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto mr-2">
        <Badge
          variant="outline"
          className="text-xs sm:text-sm border-zinc-300 dark:border-zinc-600"
        >
          Key: {analysis[0]?.[0]?.key || "C major"}
        </Badge>

        <div className="flex items-center gap-1">
          <Button
            onClick={onPlay}
            variant={
              playbackState === AudioEngineState.playing ? "default" : "outline"
            }
            size="sm"
            className={`gap-1 text-xs sm:text-sm px-2 sm:px-3 ${
              playbackState === AudioEngineState.playing
                ? "bg-brand-1 hover:bg-brand-1 text-white border-brand-1"
                : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            disabled={playbackState === AudioEngineState.playing}
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Play</span>
          </Button>

          <Button
            onClick={onPause}
            variant={
              playbackState === AudioEngineState.paused ? "default" : "outline"
            }
            size="sm"
            className={`gap-1 text-xs sm:text-sm px-2 sm:px-3 ${
              playbackState === AudioEngineState.paused
                ? "bg-brand-1 hover:bg-brand-1 text-white border-brand-1"
                : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            disabled={playbackState === AudioEngineState.stopped}
          >
            <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Pause</span>
          </Button>

          <Button
            onClick={onStop}
            variant={
              playbackState === AudioEngineState.stopped ? "default" : "outline"
            }
            size="sm"
            className={`gap-1 text-xs sm:text-sm px-2 sm:px-3 ${
              playbackState === AudioEngineState.stopped
                ? "bg-brand-1 hover:bg-brand-1 text-white border-brand-1"
                : "border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
            disabled={playbackState === AudioEngineState.stopped}
          >
            <Square className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Stop</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <div
            className={`hidden lg:inline w-2 h-2 rounded-full ${
              playbackState === AudioEngineState.playing
                ? "bg-brand-1 animate-pulse"
                : playbackState === AudioEngineState.paused
                  ? "bg-yellow-500"
                  : "bg-zinc-400"
            }`}
          />
          <span className="text-xs text-muted-foreground capitalize hidden lg:inline">
            {playbackState}
          </span>
        </div>
      </div>
    </div>
  </DialogHeader>
);
