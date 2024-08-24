import { Input } from "@/components/ui/input";
import { Track } from "../../audio-engine/components";
import { observer } from "mobx-react-lite";

interface TestTrackPanelsProps {
  tracks: Track[];
}

export const TestTrackPanels = observer(({ tracks }: TestTrackPanelsProps) => {
  return (
    <div>
      {tracks.map((track) => (
        <div
          key={track.id}
          className="flex flex-col"
          style={{
            border: `1px solid ${track.rgbColor}`,
            width: 200,
            height: 80,
          }}
        >
          <Input
            onChange={(e) => track.setName(e.target.value)}
            value={track.name}
          />
        </div>
      ))}
    </div>
  );
});
