import { observer } from "mobx-react-lite";
import { Track } from "@/pages/studio/audio-engine/components";
import { BASE_TRACK_HEIGHT } from "@/pages/studio/utils/constants";
import { Knob } from "@/components/ui/custom/knob";

interface TrackPanelProps {
  track: Track;
  trackNumber: number;
}

export const TrackPanel = observer(
  ({ track, trackNumber }: TrackPanelProps) => (
    <div
      className="flex bg-surface-1 border border-surface-0 border-b-0"
      style={{
        width: "100%",
        flexShrink: 0,
        height: BASE_TRACK_HEIGHT,
        gap: "1rem",
      }}
    >
      <div className="h-full p-1 w-8 flex items-center justify-center bg-surface-2 text-surface-4 font-bold border border-surface-1 border-b-0">
        {trackNumber}
      </div>
      <span className="text-surface-7">{track.name}</span>
      <Knob
        size={16}
        value={0}
        max={100}
        min={0}
        step={1}
        onChange={() => {}}
      />
    </div>
  )
);
