import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import type { Track } from "@/pages/studio/audio-engine/components";
import {
  useAudioEngine,
  useDeferredUpdate,
  useUndoManager,
} from "@/pages/studio/hooks";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { useRef } from "react";
import { GrPower } from "react-icons/gr";
import { MeterFader } from "@/components/ui/custom/studio/meter-fader";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { cn } from "@/lib/utils";

interface ChannelStripProps {
  track: Track;
  trackNumber: number;
  mixerHeight: number;
}

const activeButtonClass = cn(
  "hover:text-surface-10",
  "shadow-none",
  "flex",
  "items-center",
  "justify-center",
  "rounded-sm p-2 w-6 h-6 m-0 font-bold",
  "border border-primary",
  " bg-transparent",
  "text-surface-10",
  "hover:bg-surface-3"
);

const baseButtonClass = cn(
  "shadow-none",
  "hover:text-surface-6",
  "hover:bg-surface-3",
  "text-surface-5",
  "flex items-center",
  "justify-center",
  "text-surface-5",
  "bg-transparent",
  "rounded-sm",
  "border border-surface-5",
  "p-2",
  "w-6",
  "h-6",
  "m-0",
  "font-bold"
);

export const ChannelStrip = observer(
  ({ track, trackNumber, mixerHeight }: ChannelStripProps) => {
    const { mixer, state } = useAudioEngine();
    const trackNameRef = useRef<HTMLInputElement>(null);
    const { undoManager } = useUndoManager();

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
      const newState = !track.active;
      if (
        selected &&
        mixer.selectedTracks.every(
          (selectedTrack) => selectedTrack.active === track.active
        )
      ) {
        mixer.selectedTracks.forEach((track) => track.setActive(newState));
      } else {
        track.setActive(!track.active);
      }
    };

    const onVolumeChange = (value: number) => {
      track.setVolume(value);
    };

    const active =
      track.active ||
      state === AudioEngineState.playing ||
      state === AudioEngineState.recording;

    const faderContainerRef = useRef<HTMLDivElement>(null);

    const faderHeight = mixerHeight - 124;

    const handleSelectTrack = (e: React.MouseEvent) => {
      e.stopPropagation();
      undoManager.withoutUndo(() => {
        if (!e.ctrlKey) {
          mixer.unselectAllTracks();
        }

        mixer.selectTrack(track);
      });
    };

    return (
      <div
        onClick={handleSelectTrack}
        className={`flex flex-col h-full flex-shrink-0 items-center ${
          selected ? "bg-surface-3" : "bg-surface-2"
        } border border-surface-1`}
        style={{
          width: 120,
          height: mixerHeight,
        }}
      >
        <div className="flex gap-1 h-[36px] lg:h-8 items-center px-2 py-1 border-b-2 border-surface-1">
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

        <div
          style={{ height: 56 }}
          className="flex w-full justify-evenly gap-1 items-center py-3"
        >
          <Button
            onClick={(e) => {
              e.stopPropagation();
              track.setMute(!track.mute);
            }}
            className={track.mute ? activeButtonClass : baseButtonClass}
          >
            M
          </Button>
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
          <Button
            onClick={(e) => {
              e.stopPropagation();
              track.setSolo(!track.solo);
            }}
            className={track.solo ? activeButtonClass : baseButtonClass}
          >
            S
          </Button>
        </div>

        <div ref={faderContainerRef} className="h-full w-full">
          <MeterFader
            faderHeight={faderHeight}
            onChange={onVolumeChange}
            step={0.01}
            min={-60}
            max={6}
            value={track.volume}
            meters={[track.meterL, track.meterR]}
            stopDelayMs={2000}
            active={active}
            selected={selected}
          />
        </div>
        <div className="border-t-2 h-[48px] border-t-surface-1 w-full text-center flex justify-center relative">
          <p className="text-sm font-bold text-surface-5">{trackNumber}</p>
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
