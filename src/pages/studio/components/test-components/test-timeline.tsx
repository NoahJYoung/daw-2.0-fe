import { observer } from "mobx-react-lite";
import { Track } from "../../audio-engine/components";
import { TestClip } from "./test-clip";
import { BASE_TRACK_HEIGHT } from "../../utils/constants";

interface TestTimelineProps {
  tracks: Track[];
}

export const TestTimeline = observer(({ tracks }: TestTimelineProps) => {
  return (
    <div className="flex flex-col">
      {tracks.map((track) => (
        <div
          style={{ height: BASE_TRACK_HEIGHT, position: "relative" }}
          key={track.id}
        >
          {track.clips.map((clip) => (
            <TestClip key={clip.id} clip={clip} track={track} />
          ))}
        </div>
      ))}
    </div>
  );
});
