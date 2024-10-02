import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { Clip } from "./components";
import { PlaceholderClip } from "./components/clip/components";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { StudioContextMenu } from "@/components/ui/custom/studio/studio-context-menu";
import { BsFiletypeMp3 as ImportFileIcon } from "react-icons/bs";
import {
  deleteSelectedClips,
  importFromFile,
  joinClips,
  pasteClips,
  selectAllClips,
  splitSelectedClips,
} from "./helpers";
import { MenuItem } from "@/components/ui/custom/types";
import { Clip as ClipData } from "@/pages/studio/audio-engine/components/types";
import {
  AiOutlineSplitCells as SplitIcon,
  AiOutlineMergeCells as JoinIcon,
} from "react-icons/ai";
import { FiDelete as DeleteIcon } from "react-icons/fi";
import { PiSelectionAllThin as SelectAllIcon } from "react-icons/pi";
import {
  MdContentPasteGo as PasteIcon,
  MdOutlineContentCopy as CopyIcon,
} from "react-icons/md";

import * as Tone from "tone";

interface ClipsProps {
  startMeasure: number;
  endMeasure: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  scrollLeft: number;
  setPlayheadLeft: Dispatch<SetStateAction<number>>;
  measureWidth: number;
  totalMeasures: number;
  totalWidth: number;
}

export const Clips = observer(
  ({
    startMeasure,
    endMeasure,
    scrollRef,
    scrollLeft,
    setPlayheadLeft,
    totalWidth,
  }: ClipsProps) => {
    const { mixer, timeline, state, clipboard } = useAudioEngine();
    const { undoManager } = useUndoManager();
    const [selectedIndexOffset, setSelectedIndexOffset] = useState(0);
    const [selectedXOffset, setSelectedXOffset] = useState(0);
    const [loopOffset, setLoopOffset] = useState<number>(0);
    const [referenceClip, setReferenceClip] = useState<ClipData | null>(null);
    const [dragging, setDragging] = useState(false);

    const [placeholderClipPosition, setPlaceholderClipPosition] = useState<
      number | null
    >(null);

    useEffect(() => {
      if (state === AudioEngineState.recording) {
        setPlaceholderClipPosition(Tone.getTransport().seconds);
      } else {
        setPlaceholderClipPosition(null);
      }
    }, [state]);

    const sameParentTrack =
      mixer.selectedClips.length &&
      mixer.selectedClips.every(
        (selectedClip) =>
          selectedClip.trackId === mixer.selectedClips[0].trackId
      );

    const timelineContextMenuItems: MenuItem[] = [
      {
        label: "Select all",
        onClick: () => selectAllClips(mixer, undoManager),
        icon: SelectAllIcon,
        shortcut: "ctrl+a",
      },
      {
        label: "Copy",
        onClick: () => clipboard.copy(mixer.selectedClips),
        icon: CopyIcon,
        disabled: mixer.selectedClips.length === 0 || !sameParentTrack,
        shortcut: "ctrl+c",
      },
      {
        label: "Paste",
        onClick: () => pasteClips(clipboard, mixer, timeline, undoManager),
        icon: PasteIcon,
        disabled:
          clipboard.getClips().length === 0 ||
          mixer.selectedTracks.length === 0,
        shortcut: "ctrl+v",
      },
      { separator: true },
      {
        label: "Split at playhead",
        onClick: () => splitSelectedClips(mixer, timeline, undoManager),
        icon: SplitIcon,
        shortcut: "shift+s",
      },
      {
        label: "Join",
        onClick: () => joinClips(mixer, undoManager),
        icon: JoinIcon,
        disabled: mixer.selectedClips.length < 2 || !sameParentTrack,
        shortcut: "shift+j",
      },

      {
        label: "Delete",
        onClick: () => deleteSelectedClips(mixer, undoManager),
        disabled: mixer.selectedClips.length < 1,
        icon: DeleteIcon,
        shortcut: "delete",
      },
      { separator: true },
      {
        label: "Import file",
        disabled: mixer.selectedTracks.length < 1,
        onClick: () => importFromFile(mixer.selectedTracks),
        icon: ImportFileIcon,
      },
    ];

    const handleClick = (e: React.MouseEvent) => {
      if (!e.ctrlKey) {
        undoManager.withGroup(
          "UNSELECT ALL CLIPS, SELECT TRACK AT Y COORDINATES",
          () => {
            mixer.unselectAllClips();
            mixer.unselectAllTracks();

            if (scrollRef.current) {
              const trackToSelect = mixer.getTrackAtYPosition(
                e.clientY + scrollRef.current.scrollTop - 72
              );
              if (trackToSelect) {
                mixer.selectTrack(trackToSelect);
              }
            }
          }
        );
      } else {
        e.stopPropagation();
        undoManager.withGroup("SELECT TRACK AT Y COORDINATES", () => {
          if (scrollRef.current) {
            const trackToSelect = mixer.getTrackAtYPosition(
              e.clientY + scrollRef.current.scrollTop - 72
            );
            if (trackToSelect) {
              const selected = mixer.selectedTracks.includes(trackToSelect);
              if (selected) {
                mixer.unselectTrack(trackToSelect);
              } else {
                mixer.selectTrack(trackToSelect);
              }
            }
          }
        });
      }
    };

    const shouldRenderClip = (clip: ClipData) => {
      const clipStartMeasure = parseInt(
        Tone.Time(clip.start, "samples").toBarsBeatsSixteenths().split(":")[0]
      );
      const clipEndMeasure = parseInt(
        Tone.Time(clip.end + clip.loopSamples, "samples")
          .toBarsBeatsSixteenths()
          .split(":")[0]
      );
      if (clipEndMeasure >= startMeasure && clipStartMeasure <= endMeasure) {
        return true;
      }
      return false;
    };

    return (
      <StudioContextMenu
        disabled={
          state === AudioEngineState.playing ||
          state === AudioEngineState.recording
        }
        items={timelineContextMenuItems}
      >
        <div
          onContextMenu={(e) => {
            if (
              state === AudioEngineState.playing ||
              state === AudioEngineState.recording
            ) {
              e.preventDefault();
            }
          }}
          onClick={handleClick}
          className="absolute flex flex-col"
          style={{
            width: totalWidth,
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
                    setLoopOffset={setLoopOffset}
                    loopOffset={loopOffset}
                    scrollLeft={scrollLeft}
                    selectedOffset={selectedXOffset}
                    setSelectedOffset={setSelectedXOffset}
                    setPlayheadLeft={setPlayheadLeft}
                    dragging={dragging}
                    setDragging={setDragging}
                    setSelectedIndexOffset={setSelectedIndexOffset}
                    selectedIndexOffset={selectedIndexOffset}
                    scrollRef={scrollRef}
                    key={clip.id}
                    track={track}
                    clip={clip}
                    referenceClip={referenceClip}
                    setReferenceClip={setReferenceClip}
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
