import {
  AudioClip,
  MidiClip,
  Track,
} from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { AudioClipView, AudioLoop, MidiClipView, MidiLoop } from "./components";
import { MdOutlineLoop as LoopIcon } from "react-icons/md";
import { SiMidi as MidiIcon } from "react-icons/si";
import {
  useAudioEngine,
  useBottomPanelViewController,
  useUndoManager,
} from "@/pages/studio/hooks";
import {
  IoLockClosedSharp as LockedIcon,
  IoLockOpenSharp as UnlockedIcon,
} from "react-icons/io5";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  getClipValues,
  getOnClick,
  getOnMouseDown,
  getOnTouchStart,
  inBoundsY,
} from "./helpers";

import * as Tone from "tone";

interface ClipProps {
  track: Track;
  clip: AudioClip | MidiClip;
  scrollRef: React.RefObject<HTMLDivElement>;
  selectedIndexOffset: number;
  loopOffset: number;
  dragging: boolean;
  setDragging: Dispatch<SetStateAction<boolean>>;
  setPlayheadLeft: (value: number) => void;
  selectedOffset: number;
  scrollLeft: number;
  setReferenceClip: Dispatch<SetStateAction<AudioClip | MidiClip | null>>;
  isLooping: boolean;
  setIsLooping: Dispatch<SetStateAction<boolean>>;
  initialX: React.MutableRefObject<number>;
  initialY: React.MutableRefObject<number>;
}

export const Clip = observer(
  ({
    clip,
    track,
    selectedIndexOffset,
    scrollRef,
    dragging,
    setDragging,
    setPlayheadLeft,
    scrollLeft,
    selectedOffset,
    setReferenceClip,
    loopOffset,
    isLooping,
    setIsLooping,
    initialX,
    initialY,
  }: ClipProps) => {
    const { timeline, mixer } = useAudioEngine();
    const { undoManager } = useUndoManager();
    const { expandBottomPanelIfCollapsed } = useBottomPanelViewController();
    const [hovering, setHovering] = useState(false);

    const selected = mixer.selectedClips.includes(clip);

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

    const onTouchStart = getOnTouchStart(
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

    const clipTransformX = selected
      ? timeline.samplesToPixels(clip.start) + selectedOffset
      : timeline.samplesToPixels(clip.start);

    const clipInfoString = useMemo(() => {
      return `${track.name} | ${Tone.Time(
        clip.start,
        "samples"
      ).toBarsBeatsSixteenths()}`;
    }, [clip.start, track.name]);

    const clipWidth = useMemo(
      () => timeline.samplesToPixels(clip.length),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [clip.length, timeline.samplesPerPixel]
    );

    const currentDragTrack =
      selected &&
      dragging &&
      inBoundsY(mixer.tracks, mixer.selectedClips, selectedIndexOffset)
        ? mixer.tracks[parentTrackIndex + selectedIndexOffset]
        : track;

    const handleDoubleClick = (e: React.MouseEvent) => {
      undoManager.withoutUndo(() => {
        // TODO: Remove this when audio clip zoom view is implemented
        if (clip.type === "midi") {
          // mixer.setPanelMode(
          //   clip.type === "audio" ? "WAVEFORM_VIEW" : "PIANO_ROLL"
          // );
          mixer.selectFeaturedTrack(track);
          mixer.selectFeaturedClip(clip);
          mixer.setPanelMode("PIANO_ROLL");
          expandBottomPanelIfCollapsed();
        }

        if (!e.ctrlKey) {
          mixer.unselectAllTracks();
        }
        mixer.selectTrack(track);
      });
    };

    const handleLockClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      undoManager.withGroup("LOCK CLICK", () => {
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
      });
    };

    const handleMouseEnter = () => setHovering(true);
    const handleMouseLeave = () => setHovering(false);

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

    const showClipActions = clipWidth >= 40 && (hovering || selected);
    const showLock = clipWidth >= 40;
    const showMidiIcon =
      clipWidth >= 100 && clip instanceof AudioClip && clip.canConvertToMidi;

    const transformY = top;

    return (
      <>
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onScroll={(e) => {
            if (dragging) {
              e.preventDefault();
            }
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={onClick}
          onDoubleClick={handleDoubleClick}
          onDrag={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          key={clip.id}
          className=" flex flex-col flex-shrink-0 rounded-xl gap-1 pb-[4px]"
          style={{
            opacity: selected ? 0.8 : 0.6,
            marginTop: 2,
            height: height,
            background: color,
            zIndex: 9,
            position: "absolute",
            transform: `translate(${clipTransformX}px, ${transformY}px)`,
            cursor: dragging || isLooping ? "grabbing" : "auto",
            willChange: "transform",
          }}
        >
          <span className="flex items-center pl-[2px] pt-[2px]">
            {showLock && (
              <button
                className="flex items-center justify-center"
                style={{ color: "#222", width: "1rem" }}
                onClick={handleLockClick}
              >
                {clip.locked ? <LockedIcon /> : <UnlockedIcon />}
              </button>
            )}
            <p
              style={{ maxWidth: `calc(${clipWidth - 4}px - 1rem )` }}
              className="text-black ml-[2px] mt-[2px] text-xs select-none whitespace-nowrap max-w-full text-ellipsis overflow-hidden"
            >
              {clip.loading ? "Loading..." : clipInfoString}
            </p>

            {showMidiIcon ? (
              <MidiIcon className="text-black ml-2 mt-[2px]" size={24} />
            ) : (
              <span className="mt-[2px]" style={{ height: 24 }} />
            )}
          </span>

          {clip instanceof AudioClip && (
            <>
              {
                <AudioClipView
                  scrollLeft={scrollLeft}
                  track={currentDragTrack || track}
                  clip={clip as AudioClip}
                  clipLeft={clipTransformX}
                />
              }

              {showClipActions && (
                <button
                  onMouseDown={handleLoopDown}
                  onTouchStart={handleLoopDown}
                  style={{
                    transform: `translateX(${
                      (clip.length +
                        clip.loopSamples +
                        (selected ? loopOffset : 0)) /
                        timeline.samplesPerPixel -
                      24
                    }px)`,
                    bottom: 4,
                    position: "absolute",
                  }}
                  className={cn(
                    "flex flex items-center justify-center justify-center text-xl items-center opacity-80 hover:opacity-100 w-5 h-5",
                    isLooping ? "cursor-grabbing" : "cursor-grab"
                  )}
                >
                  <LoopIcon className="text-xl text-black" />
                </button>
              )}
            </>
          )}

          {clip instanceof MidiClip && (
            <>
              <MidiClipView
                track={currentDragTrack || track}
                clip={clip as MidiClip}
              />

              {showClipActions && (
                <button
                  onMouseDown={handleLoopDown}
                  onTouchStart={handleLoopDown}
                  style={{
                    transform: `translateX(${
                      (clip.length +
                        clip.loopSamples +
                        (selected ? loopOffset : 0)) /
                        timeline.samplesPerPixel -
                      24
                    }px)`,
                    bottom: 4,
                    position: "absolute",
                  }}
                  className={cn(
                    "flex flex items-center justify-center justify-center text-xl items-center opacity-80 hover:opacity-100 w-5 h-5",
                    isLooping ? "cursor-grabbing" : "cursor-grab"
                  )}
                >
                  <LoopIcon className="text-xl text-black" />
                </button>
              )}
            </>
          )}
        </div>

        {clip instanceof AudioClip &&
          clip.loopSamples + (selected ? loopOffset : 0) > 0 && (
            <AudioLoop
              loopOffset={loopOffset}
              scrollLeft={scrollLeft}
              top={top}
              color={color}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={onClick}
              onMouseDown={onMouseDown}
              track={currentDragTrack || track}
              clip={clip as AudioClip}
              clipLeft={clipTransformX}
              selected={selected}
              isLooping={isLooping && selected}
            />
          )}

        {clip instanceof MidiClip &&
          clip.loopSamples + (selected ? loopOffset : 0) > 0 && (
            <MidiLoop
              loopOffset={loopOffset}
              scrollLeft={scrollLeft}
              top={top}
              color={color}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={onClick}
              onMouseDown={onMouseDown}
              track={currentDragTrack || track}
              clip={clip}
              clipLeft={clipTransformX}
              selected={selected}
              isLooping={isLooping && selected}
            />
          )}
      </>
    );
  }
);
