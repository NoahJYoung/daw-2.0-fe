import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "./components";
import { PlaceholderClip } from "./components/clip/components";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import {
  deleteSelectedClips,
  selectAllClips,
  splitSelectedClips,
} from "./helpers";
import { MenuItem } from "@/components/ui/custom/types";
import { Clip as ClipData } from "@/pages/studio/audio-engine/components/types";
import { AiOutlineSplitCells } from "react-icons/ai";
import { FiDelete } from "react-icons/fi";
import { PiSelectionAllThin } from "react-icons/pi";
import * as Tone from "tone";

interface ClipsProps {
  startMeasure: number;
  endMeasure: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  setPlayheadLeft: Dispatch<SetStateAction<number>>;
}

export const Clips = observer(
  ({ startMeasure, endMeasure, scrollRef, setPlayheadLeft }: ClipsProps) => {
    const { mixer, timeline, state } = useAudioEngine();
    const undoManager = useUndoManager();
    const [selectedIndexOffset, setSelectedIndexOffset] = useState(0);
    const [dragging, setDragging] = useState(false);

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
        label: "Select all",
        onClick: () => selectAllClips(mixer, undoManager),
        icon: PiSelectionAllThin,
        shortcut: "ctrl+a",
      },
      { separator: true },
      {
        label: "Split at playhead",
        onClick: () => splitSelectedClips(mixer, timeline, undoManager),
        icon: AiOutlineSplitCells,
        shortcut: "shift+s",
      },

      {
        label: "Delete",
        onClick: () => deleteSelectedClips(mixer, undoManager),
        icon: FiDelete,
        shortcut: "delete",
      },
    ];

    const handleClick = (e: React.MouseEvent) => {
      if (!e.ctrlKey) {
        undoManager.withGroup("UNSELECT ALL CLIPS", () => {
          mixer.unselectAllClips();
        });
      } else {
        e.stopPropagation();
      }
    };

    const shouldRenderClip = (clip: ClipData) => {
      const clipStartMeasure = parseInt(
        Tone.Time(clip.start, "samples").toBarsBeatsSixteenths().split(":")[0]
      );
      const clipEndMeasure = parseInt(
        Tone.Time(clip.end, "samples").toBarsBeatsSixteenths().split(":")[0]
      );
      if (clipEndMeasure >= startMeasure && clipStartMeasure <= endMeasure) {
        return true;
      }
      return false;
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
          {mixer.tracks.map((track) => (
            <div key={track.id} className="flex flex-shrink-0 absolute">
              {state === AudioEngineState.recording && track.active && (
                <PlaceholderClip
                  track={track}
                  startPosition={placeholderClipPosition}
                />
              )}
              {track.clips.map((clip) =>
                shouldRenderClip(clip) ? (
                  <Clip
                    setPlayheadLeft={setPlayheadLeft}
                    dragging={dragging}
                    setDragging={setDragging}
                    setSelectedIndexOffset={setSelectedIndexOffset}
                    selectedIndexOffset={selectedIndexOffset}
                    scrollRef={scrollRef}
                    key={clip.id}
                    track={track}
                    clip={clip}
                  />
                ) : null
              )}
            </div>
          ))}
        </div>
      </StudioContextMenu>
    );
  }
);
