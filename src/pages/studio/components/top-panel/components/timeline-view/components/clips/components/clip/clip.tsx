import {
  AudioClip,
  MidiClip,
  Track,
} from "@/pages/studio/audio-engine/components";
import { Clip as ClipData } from "@/pages/studio/audio-engine/components/types";
import { observer } from "mobx-react-lite";
import { AudioClipView, AudioLoop } from "./components";
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
  useCallback,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
  useMemo,
  useState,
} from "react";
import * as Tone from "tone";
import { moveClipToNewTrack } from "../../helpers";
import { cn } from "@/lib/utils";

const inBoundsX = (
  selectedClips: ClipData[],
  movementXInSamples: number
): boolean => {
  return selectedClips.every((selectedClip) => {
    const newStart = selectedClip.start + movementXInSamples;
    return newStart >= 0;
  });
};

const inBoundsY = (
  tracks: Track[],
  selectedClips: ClipData[],
  offset: number
) => {
  if (
    selectedClips.some((selectedClip) => {
      const parentTrackIndex = tracks.findIndex(
        (track) => track.id === selectedClip.trackId
      );
      return (
        parentTrackIndex + offset >= tracks.length ||
        parentTrackIndex + offset < 0
      );
    })
  ) {
    return false;
  }
  return true;
};

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedIndexOffset: number;
  setSelectedIndexOffset: Dispatch<SetStateAction<number>>;
  dragging: boolean;
  setDragging: Dispatch<SetStateAction<boolean>>;
  setPlayheadLeft: (pixels: number) => void;
  selectedOffset: number;
  setSelectedOffset: Dispatch<SetStateAction<number>>;
  scrollLeft: number;
  selectedLoopModifier: number;
  setSelectedLoopModifier: Dispatch<SetStateAction<number>>;
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
    selectedLoopModifier,
    setSelectedLoopModifier,
    isLooping,
    setIsLooping,
  }: ClipProps) => {
    const { timeline, mixer } = useAudioEngine();
    const { undoManager } = useUndoManager();
    const { selectTrack, selectClip } = useBottomPanelViewController();
    const [showClipActions, setShowClipActions] = useState(false);

    const selected = mixer.selectedClips.includes(clip);

    const initialY = useRef<number>(0);
    const initialX = useRef<number>(0);
    const parentTrackIndex = mixer.tracks.indexOf(track);

    const onMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (e.button !== 2) {
        setDragging(true);
      }
      initialY.current = e.clientY;
      initialX.current = e.clientX;

      if (e.button !== 2) {
        undoManager.withGroup("UNSELECT ALL AND SELECT ONE", () => {
          if (!e.ctrlKey) {
            mixer.unselectAllClips();
          }

          if (!clip.locked) {
            track.selectClip(clip);
          }
        });
      }
    };
    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (e.ctrlKey) {
          return;
        }
        undoManager.withoutUndo(() => {
          if (scrollRef.current) {
            const xOffset = scrollRef.current.getBoundingClientRect().x;
            const xValue = e.clientX - xOffset + scrollRef.current.scrollLeft;
            const seconds = timeline.snapToGrid
              ? Tone.Time(
                  xValue * timeline.samplesPerPixel,
                  "samples"
                ).quantize(timeline.subdivision)
              : Tone.Time(
                  xValue * timeline.samplesPerPixel,
                  "samples"
                ).toSeconds();
            Tone.getTransport().seconds = seconds;
            timeline.setSeconds(seconds);

            const pixels =
              Tone.Time(Tone.getTransport().seconds, "s").toSamples() /
              timeline.samplesPerPixel;
            setPlayheadLeft(pixels);
          }
        });
      },
      [scrollRef, setPlayheadLeft, timeline, undoManager]
    );

    const onMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!dragging || !selected) return;

        if (isLooping) {
          const newValue =
            selectedLoopModifier + timeline.pixelsToSamples(e.movementX);

          if (clip.loopSamples + selectedLoopModifier >= 0) {
            setSelectedLoopModifier(Math.abs(newValue) >= 0 ? newValue : 0);
          }

          return;
        }

        if (
          inBoundsX(
            mixer.selectedClips,
            timeline.pixelsToSamples(e.movementX + selectedOffset)
          )
        ) {
          setSelectedOffset((prev) => prev + e.movementX);
        }

        const movementY = e.clientY - initialY?.current;
        const threshold = track.laneHeight * 0.75;

        if (Math.abs(movementY) < 20) {
          return;
        }

        const clampedThreshold = Math.max(80, Math.min(140, threshold));

        const { selectedClips, tracks } = mixer;

        if (Math.abs(movementY) >= clampedThreshold) {
          const direction = movementY > 0 ? 1 : -1;
          const newOffset = selectedIndexOffset + direction;

          if (inBoundsY(tracks, selectedClips, newOffset)) {
            setSelectedIndexOffset(newOffset);
            initialY.current = e.clientY;
          }
        }
      },
      [
        dragging,
        selected,
        isLooping,
        mixer,
        timeline,
        selectedOffset,
        track.laneHeight,
        selectedLoopModifier,
        setSelectedLoopModifier,
        clip,
        setSelectedOffset,
        selectedIndexOffset,
        setSelectedIndexOffset,
      ]
    );

    const onMouseUp = useCallback(
      (e: MouseEvent) => {
        if (isLooping) {
          const newLoopSamples = clip.loopSamples + selectedLoopModifier;
          clip.setLoopSamples(newLoopSamples > 0 ? newLoopSamples : 0);

          const loopDifference = clip.loopSamples - selectedLoopModifier;

          // mixer.selectedClips.forEach((selectedClip) => {
          //   const newLoopSamples = clip.loopSamples + loopDifference;

          //   selectedClip.setLoopSamples(
          //     newLoopSamples > 0 ? newLoopSamples : 0
          //   );
          // });
        }

        setIsLooping(false);

        setSelectedLoopModifier(0);
        setSelectedOffset(0);

        if (!dragging) {
          setDragging(false);
          return;
        }

        e.stopPropagation();
        // const initialTimeDifference = timeline.pixelsToSamples(selectedOffset);
        // const firstClipStart = clip.start + initialTimeDifference;

        // const quantizedFirstClipStart = Tone.Time(
        //   Tone.Time(firstClipStart, "samples").quantize(timeline.subdivision),
        //   "s"
        // ).toSamples();
        // console.log("FIRST START", firstClipStart);

        // const quantizeOffset = timeline.snapToGrid
        //   ? quantizedFirstClipStart - firstClipStart
        //   : 0;

        mixer.selectedClips.forEach((selectedClip) => {
          const timeOffset = timeline.pixelsToSamples(selectedOffset);
          const newStart = selectedClip.start + timeOffset; //+ quantizeOffset;

          selectedClip.setStart(newStart);
        });

        if (parentTrackIndex !== parentTrackIndex + selectedIndexOffset) {
          undoManager.withGroup("MOVE CLIPS TO NEW TRACK", () => {
            mixer.selectedClips.forEach((selectedClip) => {
              const selectedParentIndex = mixer.tracks.findIndex(
                (track) => track.id === selectedClip.trackId
              );
              if (selectedParentIndex !== -1) {
                moveClipToNewTrack(
                  selectedClip,
                  mixer,
                  undoManager,
                  selectedParentIndex,
                  selectedParentIndex + selectedIndexOffset
                );
              } else {
                throw new Error("No parent track found");
              }
            });
          });
        }

        setSelectedIndexOffset(0);
        setDragging(false);
        initialY.current = 0;
        initialX.current = 0;
      },
      [
        setIsLooping,
        clip.id,
        selectedLoopModifier,
        isLooping,
        setSelectedLoopModifier,
        setSelectedOffset,
        dragging,
        mixer,
        parentTrackIndex,
        selectedIndexOffset,
        setSelectedIndexOffset,
        setDragging,
        timeline,
        selectedOffset,
        undoManager,
      ]
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

    const getTop = () => {
      if (selected && dragging) {
        return (
          mixer.getCombinedLaneHeightsAtIndex(
            parentTrackIndex + selectedIndexOffset
          ) + 2
        );
      }

      return mixer.getCombinedLaneHeightsAtIndex(parentTrackIndex) + 2;
    };

    const getHeight = () => {
      if (selected && dragging) {
        return (
          mixer.tracks[parentTrackIndex + selectedIndexOffset]?.laneHeight - 2
        );
      }
      return track.laneHeight - 2;
    };

    const getColor = () => {
      if (selected && dragging) {
        return mixer.tracks[parentTrackIndex + selectedIndexOffset]?.color;
      }
      return track.color;
    };

    const clipInfoString = useMemo(() => {
      return `${track.name} | ${Tone.Time(
        clip.start,
        "samples"
      ).toBarsBeatsSixteenths()}`;
    }, [clip.start, track.name]);

    const clipWidth = useMemo(
      () => timeline.samplesToPixels(clip.length),
      [clip.length, timeline.samplesPerPixel, timeline]
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

    return (
      <>
        <div
          onMouseDown={onMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          key={clip.id}
          className=" flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px]"
          style={{
            opacity: selected ? 0.8 : 0.6,
            marginTop: 2,
            height: getHeight(),
            background: getColor(),
            top: getTop(),
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
                      (clip.length + clip.loopSamples + selectedLoopModifier) /
                        timeline.samplesPerPixel -
                      24,
                    bottom: 0,
                  }}
                  className={cn(
                    "absolute flex justify-center items-center w-4 h-4 border border-red-900",
                    isLooping ? "cursor-grabbing" : "cursor-grab"
                  )}
                >
                  L
                </button>
              )}
            </>
          )}
        </div>

        {clip?.type === "audio" &&
          clip.loopSamples + selectedLoopModifier > 0 && (
            <AudioLoop
              scrollLeft={scrollLeft}
              top={getTop()}
              color={getColor()}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              track={currentDragTrack || track}
              clip={clip}
              selectedLoopModifier={selectedLoopModifier}
              clipLeft={clipLeft}
              selected={selected}
              isLooping={isLooping}
            />
          )}
      </>
    );
  }
);
