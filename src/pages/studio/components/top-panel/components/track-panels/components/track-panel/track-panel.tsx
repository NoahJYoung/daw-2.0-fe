import { observer } from "mobx-react-lite";
import { Track } from "@/pages/studio/audio-engine/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  useAudioEngine,
  useBottomPanelViewController,
  useUndoManager,
} from "@/pages/studio/hooks";
import { GrPower } from "react-icons/gr";
import { changeTrackPosition, swapTrackPosition } from "./helpers";
import { FaCaretUp, FaCaretDown, FaGuitar } from "react-icons/fa";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { inputOptions } from "@/pages/studio/audio-engine/types";
import { cn } from "@/lib/utils";
import { PiCaretUpDownFill } from "react-icons/pi";
import {
  INITIAL_LANE_HEIGHT,
  MAX_LANE_HEIGHT,
  MIN_LANE_HEIGHT,
} from "@/pages/studio/audio-engine/constants";

const DRAG_THRESHOLD = 24;

const activeButtonClass = cn(
  "hover:text-surface-10",
  "shadow-none",
  "flex",
  "items-center",
  "justify-center",
  "rounded-xxs p-2 w-6 h-6 m-0 font-bold",
  " bg-transparent",
  "text-surface-10",
  "hover:bg-surface-3"
);

const baseButtonClass = cn(
  "shadow-none",
  "hover:text-surface-6",
  "hover:bg-surface-3",
  "text-surface-5",
  "flex items-center",
  "justify-center",
  "text-surface-5",
  "bg-transparent",
  "rounded-xxs",
  "p-2",
  "w-6",
  "h-6",
  "m-0",
  "font-bold"
);

interface TrackPanelProps {
  track: Track;
  trackNumber: number;
  parentRef: React.RefObject<HTMLDivElement>;
}

export const TrackPanel = observer(
  ({ track, trackNumber, parentRef }: TrackPanelProps) => {
    const { undoManager } = useUndoManager();
    const { mixer } = useAudioEngine();
    const [isDragging, setIsDragging] = useState(false);
    const [yOffset, setYOffset] = useState(0);
    const trackNameRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const dragStartYPosition = useRef<number | null>(null);
    const [newTrackIndex, setNewTrackIndex] = useState<number | null>(null);
    const { expandBottomPanelIfCollapsed } = useBottomPanelViewController();

    const handleMouseDown = useCallback(() => {
      document.body.style.userSelect = "none";
      track.setIsResizing(true);
    }, [track]);

    const handleMouseUp = useCallback(() => {
      if (
        isDragging &&
        newTrackIndex !== null &&
        newTrackIndex !== trackNumber - 1
      ) {
        changeTrackPosition(mixer.tracks, trackNumber - 1, newTrackIndex);
        setNewTrackIndex(null);
      }
      track.setIsResizing(false);
      setIsDragging(false);
      dragStartYPosition.current = null;
      document.body.style.userSelect = "";
    }, [isDragging, mixer.tracks, newTrackIndex, trackNumber, track]);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();

        if (
          isDragging &&
          !track.isResizing &&
          dragStartYPosition.current !== null &&
          parentRef.current
        ) {
          requestAnimationFrame(() => {
            const currentPosition = e.clientY + parentRef.current!.scrollTop;
            const startPosition =
              dragStartYPosition.current! + parentRef.current!.scrollTop;
            const difference = currentPosition - startPosition;

            setYOffset(difference);

            if (Math.abs(difference) > DRAG_THRESHOLD) {
              const totalTracks = mixer.tracks.length;
              let newIndex = trackNumber - 1;

              let closestIndex = trackNumber - 1;
              let closestDistance = Infinity;

              for (let i = 0; i < totalTracks; i++) {
                const cumulativeHeight = mixer.getCombinedLaneHeightsAtIndex(i);
                const nextCumulativeHeight =
                  mixer.getCombinedLaneHeightsAtIndex(i + 1);

                if (
                  currentPosition > cumulativeHeight &&
                  currentPosition < nextCumulativeHeight
                ) {
                  newIndex = i;
                  break;
                } else {
                  const distance = Math.min(
                    Math.abs(currentPosition - cumulativeHeight),
                    Math.abs(currentPosition - nextCumulativeHeight)
                  );

                  if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                  }
                }
              }

              if (newIndex === trackNumber - 1) {
                newIndex = closestIndex;
              }

              setNewTrackIndex(newIndex);
            }
          });
        }

        if (track.isResizing) {
          undoManager.withoutUndo(() =>
            track.setLaneHeight(track.laneHeight + e.movementY)
          );
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        isDragging,
        track.isResizing,
        mixer,
        trackNumber,
        undoManager,
        track,
        parentRef,
      ]
    );

    const handleDragStart = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsDragging(true);
      dragStartYPosition.current = e.clientY;
    };

    useEffect(() => {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [handleMouseMove, handleMouseUp]);

    const selected = mixer.selectedTracks.includes(track);

    const handleSelectTrack = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (track.isResizing || isDragging) {
        return;
      }
      if (!e.ctrlKey) {
        mixer.unselectAllTracks();
      }

      mixer.selectTrack(track);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      undoManager.withGroup("UNSELECT AND SELECT CLIPS OF SAME TRACK", () => {
        if (!e.ctrlKey) {
          mixer.unselectAllTracks();
          mixer.unselectAllClips();
        }
        mixer.selectTrack(track);
        track.clips.forEach((trackClip) => {
          if (!trackClip.locked) {
            track.selectClip(trackClip);
          }
        });
        undoManager.withoutUndo(() => {
          mixer.selectFeaturedTrack(track);
          mixer.setPanelMode("TRACK_FX");
          expandBottomPanelIfCollapsed();
        });
      });
    };

    const handleToggleActive = (e: React.MouseEvent) => {
      e.stopPropagation();
      const newState = !track.active;
      if (
        selected &&
        mixer.selectedTracks.every(
          (selectedTrack) => selectedTrack.active === track.active
        )
      ) {
        mixer.selectedTracks.forEach((track) => track.setActive(newState));
      } else {
        track.setActive(!track.active);
      }
    };

    const getIndicatorPosition = () => {
      if (newTrackIndex) {
        return newTrackIndex > trackNumber - 1
          ? mixer.getCombinedLaneHeightsAtIndex(newTrackIndex + 1)
          : mixer.getCombinedLaneHeightsAtIndex(newTrackIndex) +
              mixer.tracks[newTrackIndex].laneHeight;
      }
      return 0;
    };

    const handleToggleExpand = (e: React.MouseEvent) => {
      e.stopPropagation();
      undoManager.withoutUndo(() => {
        if (track.laneHeight < INITIAL_LANE_HEIGHT) {
          track.setLaneHeight(INITIAL_LANE_HEIGHT);
        } else if (track.laneHeight < MAX_LANE_HEIGHT) {
          track.setLaneHeight(MAX_LANE_HEIGHT);
        } else {
          track.setLaneHeight(MIN_LANE_HEIGHT);
        }
      });
    };

    const selectedBgOffset = selected ? 1 : 0;

    const showExpandedOptions = track.laneHeight > 75;
    const showInstrumentSelector = track.laneHeight > 130;

    const showPositionArrows = track.laneHeight > 60;

    return (
      <>
        {isDragging && <div style={{ height: track.laneHeight, zIndex: -1 }} />}
        {isDragging && !!newTrackIndex && (
          <div
            className="absolute w-[249px] h-[2px] bg-surface-5 w-full rounded-xl"
            style={{
              top: getIndicatorPosition(),
              zIndex: 2,
            }}
          />
        )}
        <div
          onClick={handleSelectTrack}
          onDoubleClick={handleDoubleClick}
          className={cn(
            "select-none",
            "flex rounded-xxs",
            "gap-1",
            "pr-1",
            "w-full",
            "flex-shrink-0",
            {
              "border-surface-0 border-b-1 border-r-2 border": isDragging,
            },
            "w-full",
            `bg-surface-${1 + selectedBgOffset}`,
            "border",
            "border-surface-0",
            "border-l-0",
            { "border-b-0": !isDragging },
            "static",
            { absolute: isDragging }
          )}
          style={{
            height: track.laneHeight,
            top: mixer.getCombinedLaneHeightsAtIndex(trackNumber - 1) + yOffset,
            zIndex: isDragging ? 3 : 1,
          }}
        >
          <span
            style={{
              height: track.laneHeight - 2,
              background: "transparent",
              width: 8,
              zIndex: 4,
            }}
            className="absolute flex items-center "
          >
            <span
              style={{
                background: track.color,
                height: "75%",
                borderTopRightRadius: 2,
                borderBottomRightRadius: 2,
                opacity: selected ? 0.75 : 0.5,
              }}
              className="w-full border-surface-1 border-1 border"
            />
          </span>
          <div
            onMouseDown={handleDragStart}
            style={{ cursor: isDragging ? "grabbing" : "auto" }}
            className={`relative h-full select-none rounded-xxs p-1 w-9 flex-shrink-0 flex items-center justify-center bg-surface-${
              2 + selectedBgOffset
            } text-surface-${
              4 + selectedBgOffset
            } font-bold border-r-4 border-surface-0 border-b-0`}
          >
            {showPositionArrows && (
              <span
                style={{ height: track.laneHeight }}
                className="flex flex-col justify-between absolute items-center"
              >
                <StudioButton
                  className={`rounded-xxs bottom-[0px] shadow-none text-l relative flex items-center justify-centers p-1 w-6 h-6 bg-transparent text-surface-${
                    3 + selectedBgOffset
                  } hover:text-surface-${
                    4 + selectedBgOffset
                  } hover:bg-transparent`}
                  icon={FaCaretUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    swapTrackPosition(
                      mixer.tracks,
                      trackNumber - 1,
                      trackNumber - 2
                    );
                  }}
                />
                <StudioButton
                  className={`rounded-xxs bottom-[0px] shadow-none text-l relative flex items-center justify-centers p-1 w-6 h-6 bg-transparent text-surface-${
                    3 + selectedBgOffset
                  } hover:text-surface-${
                    4 + selectedBgOffset
                  } hover:bg-transparent`}
                  icon={FaCaretDown}
                  style={{ bottom: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    swapTrackPosition(
                      mixer.tracks,
                      trackNumber - 1,
                      trackNumber
                    );
                  }}
                />
              </span>
            )}

            {trackNumber}
          </div>
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex gap-2 items-center">
              <Button
                onClick={handleToggleActive}
                className={`bg-transparent ${
                  track.active ? "text-brand-1" : "text-surface-4"
                } rounded-full text-xl w-5 h-5 p-0 flex items-center justify-center hover:bg-surface-${
                  1 + selectedBgOffset
                } hover:opacity-80`}
              >
                <GrPower className="text-lg w-5 h-5 flex items-center justify-center" />
              </Button>
              <input
                ref={trackNameRef}
                type="text"
                className={` text-surface-6 w-full bg-surface-${
                  1 + selectedBgOffset
                } focus:bg-surface-3 focus:select-text my-2 p-1 text-ellipsis focus:outline-none text-sm h-6`}
                value={track.name}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => track.setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    trackNameRef?.current?.blur();
                  }
                }}
              />
              <span className="flex gap-1 items-center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    track.setMute(!track.mute);
                  }}
                  className={track.mute ? activeButtonClass : baseButtonClass}
                >
                  M
                </Button>
                <Button
                  onClick={(e) => e.stopPropagation()}
                  className={baseButtonClass}
                >
                  S
                </Button>
              </span>
              <button
                className="w-5 h-5 text-surface-3 text-md z-10 top-0 right-0 hover:opacity-80"
                onClick={handleToggleExpand}
              >
                <PiCaretUpDownFill />
              </button>
            </div>

            <span className="flex flex-col">
              {showExpandedOptions && (
                <div className="flex flex-col gap-1">
                  {showInstrumentSelector && (
                    <StudioDropdown
                      options={[{ label: "Synth", value: "synth" }]}
                      value={"synth"}
                      disabled
                      placeholder={t(
                        "studio.trackPanel.placeholders.instrument"
                      )}
                      colorOffset={selectedBgOffset}
                      icon={<FaGuitar />}
                      onChange={() => {}}
                    />
                  )}

                  <StudioDropdown
                    options={inputOptions.map((option) => ({
                      label: t(`studio.trackPanel.inputOptions.${option}`),
                      value: option,
                    }))}
                    value={track.input}
                    colorOffset={selectedBgOffset}
                    placeholder={t("studio.trackPanel.placeholders.input")}
                    icon={<MdOutlineSettingsInputComponent />}
                    onChange={(input) => track.setInput(input)}
                  />
                </div>
              )}

              <div
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()}
                onDoubleClick={() => track.resetLaneHeight()}
                className="w-full h-4 flex-shrink-0"
                style={{ cursor: "ns-resize" }}
              />
            </span>
          </div>
        </div>
      </>
    );
  }
);
