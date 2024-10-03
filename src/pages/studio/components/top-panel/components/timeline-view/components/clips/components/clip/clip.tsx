import {
  AudioClip,
  MidiClip,
  Track,
} from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { AudioClipView, AudioLoop } from "./components";
import { MdOutlineLoop as LoopIcon } from "react-icons/md";
import {
  useAudioEngine,
  useBottomPanelViewController,
  useUndoManager,
} from "@/pages/studio/hooks";
import {
  IoLockClosedSharp as LockedIcon,
  IoLockOpenSharp as UnlockedIcon,
} from "react-icons/io5";
import {
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import {
  getClipValues,
  getOnClick,
  getOnMouseDown,
  getOnMouseMove,
  getOnMouseUp,
  inBoundsY,
} from "./helpers";

import * as Tone from "tone";

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedIndexOffset: number;
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>;
  loopOffset: number;
  setLoopOffset: Dispatch<SetStateAction<number>>;
  dragging: boolean;
  setDragging: Dispatch<SetStateAction<boolean>>;
  setPlayheadLeft: React.Dispatch<SetStateAction<number>>;
  selectedOffset: number;
  setSelectedOffset: Dispatch<SetStateAction<number>>;
  scrollLeft: number;
  referenceClip: AudioClip | MidiClip | null;
  setReferenceClip: Dispatch<SetStateAction<AudioClip | MidiClip | null>>;
  isLooping: boolean;
  setIsLooping: Dispatch<SetStateAction<boolean>>;
}

export const Clip = observer(
  ({
    clip,
    track,
    selectedIndexOffset,
    setSelectedIndexOffset,
    scrollRef,
    dragging,
    setDragging,
    setPlayheadLeft,
    scrollLeft,
    selectedOffset,
    setSelectedOffset,
    referenceClip,
    setReferenceClip,
    loopOffset,
    setLoopOffset,
    isLooping,
    setIsLooping,
  }: ClipProps) => {
    const { timeline, mixer } = useAudioEngine();
    const { undoManager } = useUndoManager();
    const { selectTrack, selectClip } = useBottomPanelViewController();
    // const [isLooping, setIsLooping] = useState(false);
    // const [loopOffset, setLoopOffset] = useState<number>(0);

    const [showClipActions, setShowClipActions] = useState(false);

    const selected = mixer.selectedClips.includes(clip);

    const initialY = useRef<number>(0);
    const initialX = useRef<number>(0);
    const parentTrackIndex = mixer.tracks.indexOf(track);

    const onMouseDown = getOnMouseDown(
      initialX,
      initialY,
      setDragging,
      clip,
      track,
      mixer,
      undoManager,
      setReferenceClip
    );

    const onClick = getOnClick(
      scrollRef,
      timeline,
      setPlayheadLeft,
      undoManager
    );

    const onMouseMove = getOnMouseMove(
      dragging,
      selected,
      isLooping,
      referenceClip,
      track,
      timeline,
      mixer,
      selectedOffset,
      setSelectedOffset,
      selectedIndexOffset,
      setSelectedIndexOffset,
      initialY,
      setLoopOffset,
      loopOffset
    );

    const onMouseUp = getOnMouseUp(
      dragging,
      setDragging,
      setIsLooping,
      isLooping,
      selectedOffset,
      setSelectedOffset,
      selectedIndexOffset,
      setSelectedIndexOffset,
      referenceClip,
      timeline,
      mixer,
      undoManager,
      parentTrackIndex,
      initialX,
      initialY,
      setReferenceClip,
      setLoopOffset,
      loopOffset
    );

    const clipLeft = selected
      ? timeline.samplesToPixels(clip.start) + selectedOffset
      : timeline.samplesToPixels(clip.start);

    useEffect(() => {
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("mousemove", onMouseMove);
      return () => {
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
      };
    }, [onMouseMove, onMouseUp]);

    const clipInfoString = useMemo(() => {
      return `${track.name} | ${Tone.Time(
        clip.start,
        "samples"
      ).toBarsBeatsSixteenths()}`;
    }, [clip.start, track.name]);

    const clipWidth = useMemo(
      () => timeline.samplesToPixels(clip.length),
      [clip.length, timeline.samplesPerPixel]
    );

    const currentDragTrack =
      selected &&
      dragging &&
      inBoundsY(mixer.tracks, mixer.selectedClips, selectedIndexOffset)
        ? mixer.tracks[parentTrackIndex + selectedIndexOffset]
        : track;

    const handleDoubleClick = (e: React.MouseEvent) => {
      selectTrack(track);
      selectClip(clip);
      if (!e.ctrlKey) {
        mixer.unselectAllTracks();
      }
      mixer.selectTrack(track);
    };

    const handleLockClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (
        selected &&
        mixer.selectedClips.every(
          (selectedClip) => selectedClip.locked === clip.locked
        )
      ) {
        mixer.selectedClips.forEach((selectedClip) => {
          selectedClip.setLocked(!clip.locked);
          const parentTrack = mixer.tracks.find(
            (track) => track.id === selectedClip.trackId
          );
          parentTrack?.unselectClip(selectedClip);
        });
      } else {
        clip.setLocked(!clip.locked);
        if (clip.locked && selected) {
          track.unselectClip(clip);
        } else {
          if (!e.ctrlKey) {
            mixer.unselectAllClips();
          }
          track.selectClip(clip);
        }
      }
    };

    const handleMouseEnter = () => setShowClipActions(true);
    const handleMouseLeave = () => setShowClipActions(false);

    const handleLoopDown = () => {
      setIsLooping(true);
    };

    const { top, height, color } = getClipValues(
      selected,
      dragging,
      track,
      mixer,
      parentTrackIndex,
      selectedIndexOffset
    );

    return (
      <>
        <div
          onMouseDown={onMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
          onDoubleClick={handleDoubleClick}
          key={clip.id}
          className=" flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px]"
          style={{
            opacity: selected ? 0.8 : 0.6,
            marginTop: 2,
            height: height,
            background: color,
            top: top,
            zIndex: 9,
            position: "absolute",
            left: clipLeft,
            cursor: dragging ? "grabbing" : "auto",
          }}
        >
          <span className="flex items-center pl-[2px] pt-[2px]">
            <button
              className="flex items-center justify-center"
              style={{ color: "#222", width: "1rem" }}
              onClick={handleLockClick}
            >
              {clip.locked ? <LockedIcon /> : <UnlockedIcon />}
            </button>
            <p
              style={{ maxWidth: `calc(${clipWidth - 4}px - 1rem )` }}
              className="text-black ml-[2px] mt-[2px] text-xs select-none whitespace-nowrap max-w-full text-ellipsis overflow-hidden"
            >
              {clipInfoString}
            </p>
          </span>

          {clip?.type === "audio" && (
            <>
              <AudioClipView
                scrollLeft={scrollLeft}
                track={currentDragTrack || track}
                clip={clip}
                clipLeft={clipLeft}
              />

              {showClipActions && (
                <button
                  onMouseDown={handleLoopDown}
                  style={{
                    left:
                      (clip.length +
                        clip.loopSamples +
                        (selected ? loopOffset : 0)) /
                        timeline.samplesPerPixel -
                      24,
                    bottom: 4,
                  }}
                  className={cn(
                    "absolute flex flex items-center justify-center justify-center text-xl items-center opacity-80 hover:opacity-100 w-5 h-5",
                    isLooping ? "cursor-grabbing" : "cursor-grab"
                  )}
                >
                  <LoopIcon className="text-xl text-black" />
                </button>
              )}
            </>
          )}
        </div>

        {clip?.type === "audio" &&
          clip.loopSamples + (selected ? loopOffset : 0) > 0 && (
            <AudioLoop
              loopOffset={loopOffset}
              scrollLeft={scrollLeft}
              top={top}
              color={color}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              track={currentDragTrack || track}
              clip={clip}
              clipLeft={clipLeft}
              selected={selected}
              isLooping={isLooping}
            />
          )}
      </>
    );
  }
);
