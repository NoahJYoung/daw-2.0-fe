import { Music, AlertCircle } from "lucide-react";

interface EmptyAnalysisProps {
  isSelectedTracksEmpty: boolean;
}

export const EmptyAnalysis = ({
  isSelectedTracksEmpty,
}: EmptyAnalysisProps) => {
  return (
    <div className="flex flex-col items-center justify-center lg:h-[50vh] px-4 py-2 lg:py-12 text-center">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-6 hidden lg:inline">
        <Music className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
      </div>

      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        No Harmonic Analysis Available
      </h3>

      <div className="flex items-center gap-1.5 mb-4">
        <AlertCircle className="w-4 h-4 text-amber-500" />
        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
          {isSelectedTracksEmpty
            ? "No tracks selected for analysis"
            : "Not enough harmonic content to analyze"}
        </p>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-8 hidden lg:inline">
        {isSelectedTracksEmpty
          ? "Please select one or more tracks containing harmonic content (chords, melodies) to generate a harmonic analysis."
          : "Harmonic analysis requires multiple notes played simultaneously or in sequence to identify chords and progressions."}
      </p>

      <div className="lg:space-y-4 w-full max-w-xs">
        <div className="flex items-center gap-2 justify-center hidden lg:inline">
          <div className="h-px bg-zinc-200 dark:bg-zinc-700 flex-1" />
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-400 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <p className="mb-2 font-medium">Try:</p>
          <ul className="space-y-1 text-left list-disc pl-5">
            <li>Selecting more tracks</li>
            <li>Adding chord progressions</li>
            <li>Including multiple simultaneous notes</li>
            <li>Using a larger variety of pitches</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
