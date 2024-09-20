import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import type { Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine, useDeferredUpdate } from "@/pages/studio/hooks";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { useRef } from "react";
import { GrPower } from "react-icons/gr";
import { StudioSlider } from "@/components/ui/custom/studio/studio-slider";

interface ChannelStripProps {
  track: Track;
  trackNumber: number;
}

export const ChannelStrip = observer(
  ({ track, trackNumber }: ChannelStripProps) => {
    const { mixer } = useAudioEngine();
    const trackNameRef = useRef<HTMLInputElement>(null);

    const { onValueChange: onVolumeChange, onValueCommit: commitVolumeChange } =
      useDeferredUpdate<number[]>([track.volume], (values) =>
        track.setVolume(values[0])
      );

    const { onValueChange: onPanChange, onValueCommit: commitPanChange } =
      useDeferredUpdate<number>(track.pan, (value) => track.setPan(value));

    const selected = mixer.selectedTracks.includes(track);

    const displayPercentage = (value: number) => {
      const percentage = Math.round(Math.abs(value) * 100);
      if (value < 0) {
        return `L${percentage}%`;
      }
      if (value > 0) {
        return `R${percentage}%`;
      }

      return `${percentage}%`;
    };

    const resetPan = () => track.setPan(0);

    const handleToggleActive = (e: React.MouseEvent) => {
      e.stopPropagation();
      track.setActive(!track.active);
    };

    return (
      <div
        className={`flex flex-col flex-shrink-0 items-center ${
          selected ? "bg-surface-3" : "bg-surface-2"
        } border border-surface-1`}
        style={{
          width: 120,
          height: "100%",
        }}
      >
        <div className="flex gap-1 items-center px-2 py-1 border-b-2 border-surface-1">
          <Button
            onClick={handleToggleActive}
            className={`bg-transparent ${
              track.active ? "text-brand-1" : "text-surface-4"
            } rounded-full text-xl w-5 h-5 p-0 flex items-center justify-center bg-transparent hover:bg-transparent hover:opacity-80`}
          >
            <GrPower className="text-lg w-5 h-5 flex items-center bg-transparent justify-center" />
          </Button>
          <input
            ref={trackNameRef}
            type="text"
            className={` text-surface-6 w-full bg-transparent focus:bg-surface-3 focus:select-text my-1 p-1 text-ellipsis focus:outline-none text-sm h-6`}
            value={track.name}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => track.setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                trackNameRef?.current?.blur();
              }
            }}
          />
        </div>

        <div className="flex w-full gap-1 items-center justify-center py-3">
          <Knob
            onValueChange={onPanChange}
            onValueCommit={commitPanChange}
            renderValue={displayPercentage}
            onDoubleClick={resetPan}
            value={track.pan}
            min={-1}
            max={1}
            step={0.02}
            size={32}
            double={true}
            minLabel="L"
            maxLabel="R"
          />
        </div>

        <div className="h-full py-1">
          <StudioSlider
            onValueChange={onVolumeChange}
            orientation="vertical"
            onValueCommit={commitVolumeChange}
            step={0.01}
            min={-100}
            max={6}
            value={[track.volume]}
          />
        </div>
        <div className="border-t-2 h-[64px] border-t-surface-1 w-full text-center flex justify-center relative">
          <p className="font-bold text-surface-5">{trackNumber}</p>
          <span
            className="absolute border border-surface-1"
            style={{
              width: "75%",
              height: 6,
              background: track.color,
              bottom: 0,
              opacity: selected ? 1 : 0.75,
            }}
          />
        </div>
      </div>
    );
  }
);
