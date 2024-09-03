import { observer } from "mobx-react-lite";
import { Track } from "@/pages/studio/audio-engine/components";
import { useCallback, useEffect, useState } from "react";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { FaGuitar } from "react-icons/fa";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useUndoManager } from "@/pages/studio/hooks";
import { GrPower } from "react-icons/gr";

const basePanelButtonClasses = [
  "hover:text-surface-6",
  "hover:bg-surface-3",
  "text-surface-5",
  "flex",
  "items-center",
  "justify-center",
  "bg-surface-2",
  "rounded-xxs",
  "p-2",
  "w-6",
  "h-6",
  "m-0",
  "font-bold",
];

interface TrackPanelProps {
  track: Track;
  trackNumber: number;
}

export const TrackPanel = observer(
  ({ track, trackNumber }: TrackPanelProps) => {
    const undoManager = useUndoManager();
    const [isResizing, setIsResizing] = useState(false);
    const { t } = useTranslation();

    const handleMouseDown = useCallback(() => {
      document.body.style.userSelect = "none";
      setIsResizing(true);
    }, []);

    const handleMouseUp = useCallback(() => {
      setIsResizing(false);
      document.body.style.userSelect = "";
    }, []);

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        e.preventDefault();
        if (isResizing) {
          undoManager.withoutUndo(() =>
            track.setLaneHeight(track.laneHeight + e.movementY)
          );
        }
      },
      [isResizing, track, undoManager]
    );

    useEffect(() => {
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("mousemove", handleMouseMove);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, [handleMouseMove, handleMouseUp]);

    ///
    const [testInputValue, setTestInputValue] = useState<string>("");
    const [testInstrumentValue, setTestInstrumentValue] = useState<string>("");

    ///

    const showExpandedOptions = track.laneHeight > 75;
    const showInstrumentSelector = track.laneHeight > 110;
    return (
      <div
        className="flex rounded-xxs gap-1 pr-1 w-full flex-shrink-0 w-full bg-surface-1 border border-surface-0 border-b-0 border-l-0"
        style={{
          height: track.laneHeight,
        }}
      >
        <div className="h-full rounded-xxs p-1 w-9 flex-shrink-0 flex items-center justify-center bg-surface-2 text-surface-4 font-bold border-r-4 border-surface-0 border-b-0">
          {trackNumber}
        </div>
        <div className="w-full h-full flex flex-col justify-between">
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => track.setActive(!track.active)}
              className={`bg-transparent ${
                track.active ? "text-red-900" : "text-surface-4"
              } rounded-full text-xl w-5 h-5 p-0 flex items-center justify-center hover:bg-surface-1 hover:opacity-80`}
            >
              <GrPower className="text-lg w-5 h-5" />
            </Button>
            <input
              type="text"
              className="text-surface-6 w-full bg-surface-1 focus:bg-surface-2 my-2 p-1 focus:outline-none text-sm h-6"
              value={track.name}
              onChange={(e) => track.setName(e.target.value)}
            />
            <span className="flex gap-1 items-center">
              <Button
                onClick={() => track.setMute(!track.mute)}
                className={
                  track.mute
                    ? [
                        ...basePanelButtonClasses,
                        "bg-surface-4",
                        "text-surface-7",
                        "hover:bg-surface-5",
                        "hover:text-surface-7",
                      ].join(" ")
                    : basePanelButtonClasses.join(" ")
                }
              >
                M
              </Button>
              <Button className={basePanelButtonClasses.join(" ")}>S</Button>
            </span>
          </div>

          <span className="flex flex-col">
            {showExpandedOptions && (
              <div className="flex flex-col gap-1">
                <StudioDropdown
                  options={[]}
                  value={testInputValue}
                  placeholder={t("studio.trackPanel.placeholders.input")}
                  icon={<MdOutlineSettingsInputComponent />}
                  onChange={(value: string) => setTestInputValue(value)}
                />

                {showInstrumentSelector && (
                  <StudioDropdown
                    options={[{ label: "Piano", value: "piano" }]}
                    value={testInstrumentValue}
                    placeholder={t("studio.trackPanel.placeholders.instrument")}
                    icon={<FaGuitar />}
                    onChange={(value: string) => setTestInstrumentValue(value)}
                  />
                )}
              </div>
            )}

            <div
              onMouseDown={handleMouseDown}
              onDoubleClick={() => track.resetLaneHeight()}
              className="w-full h-4 flex-shrink-0"
              style={{ cursor: "ns-resize" }}
            />
          </span>
        </div>
      </div>
    );
  }
);
