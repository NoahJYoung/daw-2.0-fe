import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "./components";
import { PlaceholderClip } from "./components/clip/components";
import { useEffect, useState } from "react";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { splitSelectedClips } from "./helpers";
import { MenuItem } from "@/components/ui/custom/types";

export const Clips = observer(() => {
  const { mixer, timeline, state } = useAudioEngine();
  const undoManager = useUndoManager();
  const [placeholderClipPosition, setPlaceholderClipPosition] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (state === AudioEngineState.recording) {
      setPlaceholderClipPosition(timeline.seconds);
    } else {
      setPlaceholderClipPosition(null);
    }
  }, [state, timeline.seconds]);

  const timelineContextMenuItems: MenuItem[] = [
    {
      label: "Clips",
      children: [
        {
          label: "Split at playhead",
          onClick: (e) => splitSelectedClips(e, mixer, timeline, undoManager),
        },
      ],
    },

    { separator: true },
    { label: "item 2" },
  ];

  const handleClick = () => {
    undoManager.withGroup(() => {
      mixer.unselectAllClips();
    });
  };

  return (
    <StudioContextMenu items={timelineContextMenuItems}>
      <div
        onClick={handleClick}
        className="absolute flex flex-col"
        style={{
          width: timeline.pixels,
          height: mixer.topPanelHeight,
          top: 72,
        }}
      >
        {mixer.tracks.map((track, i) => (
          <div
            style={{ top: mixer.getCombinedLaneHeightsAtIndex(i) }}
            key={track.id}
            className="flex flex-shrink-0 absolute"
          >
            {state === AudioEngineState.recording && track.active && (
              <PlaceholderClip
                track={track}
                startPosition={placeholderClipPosition}
              />
            )}
            {track.clips.map((clip) => (
              <Clip key={clip.id} track={track} clip={clip} />
            ))}
          </div>
        ))}
      </div>
    </StudioContextMenu>
  );
});
