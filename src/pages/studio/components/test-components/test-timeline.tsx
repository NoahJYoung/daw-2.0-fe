import { observer } from "mobx-react-lite";
import { Track } from "../../audio-engine/components";
import { TestClip } from "./test-clip";

interface TestTimelineProps {
  tracks: Track[];
}

export const TestTimeline = observer(({ tracks }: TestTimelineProps) => {
  return (
    <div className="flex flex-col">
      {tracks.map((track) => (
        <div style={{ height: 80, position: "relative" }} key={track.id}>
          {track.clips.map((clip) => (
            <TestClip key={clip.id} clip={clip} track={track} />
          ))}
        </div>
      ))}
    </div>
  );
});
