import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { OscillatorControls } from "./components";
import { IconType } from "react-icons/lib";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { FaDiceFive as RandomizeIcon } from "react-icons/fa";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useSynthPresets } from "./hooks";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { IoMdSave } from "react-icons/io";
import { HiOutlineTrash as DeleteIcon } from "react-icons/hi";
import React, { useState } from "react";
import { getSnapshot } from "mobx-keystone";
interface SynthSettingsModalProps {
  track: Track;
  triggerIcon: IconType;
  triggerClassName: string;
}

export const SynthSettingsModal = observer(
  ({ track, triggerClassName, triggerIcon }: SynthSettingsModalProps) => {
    const { undoManager } = useUndoManager();
    const { state } = useAudioEngine();
    const {
      menuOptions,
      savePreset,
      selectPreset,
      deleteSelectedPreset,
      setActivePreset,
      activePreset,
    } = useSynthPresets(track);
    const [inputState, setInputState] = useState("");

    const randomize = (e: React.MouseEvent) => {
      e.stopPropagation();
      setActivePreset(null);
      undoManager.withGroup("RANDOMIZE SETTINGS", () => {
        track.synth.randomize();
      });
    };

    const active =
      (track.inputType === "midi" && track.active) ||
      state === AudioEngineState.playing ||
      state === AudioEngineState.recording;

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteSelectedPreset();
    };

    const handleSave = (e: React.MouseEvent) => {
      e.stopPropagation();
      const data = getSnapshot(track.synth);
      const name = inputState;

      if (data && name) {
        savePreset({ data, name });
        setInputState("");
      }
    };

    return (
      <StudioDialog
        title={`${track.name} - ${activePreset?.name || "Synthesizer"}`}
        triggerIcon={triggerIcon}
        triggerClassName={triggerClassName}
      >
        <div className="overflow-auto max-w-full max-h-full flex flex-col gap-2 align-end">
          <div className="mx-3 flex items-center justify-between">
            <StudioButton
              onClick={randomize}
              icon={RandomizeIcon}
              className="rounded-xxs focus-visible:ring-0 shadow-none text-2xl relative flex items-center justify-center p-1 w-8 h-8 bg-transparent text-surface-5 hover:opacity-80 hover:bg-transparent"
            />
            <span className="flex gap-1 items-center justify-end w-full">
              <StudioDropdown
                style={{ width: "33%" }}
                options={menuOptions}
                value={activePreset?.id || null}
                placeholder="Presets"
                disabled={menuOptions.length < 1}
                icon={<MdOutlineSettingsInputComponent />}
                onChange={(preset) => selectPreset(preset)}
                colorOffset={1}
              />
              <StudioButton
                onClick={handleDelete}
                icon={DeleteIcon}
                disabled={!activePreset}
                className="rounded-xxs focus-visible:ring-0 shadow-none text-2xl relative flex items-center justify-center p-1 w-8 h-8 bg-transparent text-surface-5 hover:opacity-80 hover:bg-transparent"
              />
              <input
                type="text"
                placeholder="Enter a preset name"
                className="placeholder:text-surface-4 border border-surface-3 text-surface-7 w-1/3 bg-transparent focus:select-text p-1 text-ellipsis focus:outline-none text-sm h-7"
                value={inputState}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                onChange={(e) => setInputState(e.target.value)}
              />
              <StudioButton
                onClick={handleSave}
                disabled={!inputState}
                icon={IoMdSave}
                className="rounded-xxs focus-visible:ring-0 shadow-none text-2xl relative flex items-center justify-center p-1 w-8 h-8 bg-transparent text-surface-5 hover:opacity-80 hover:bg-transparent"
              />
            </span>
          </div>

          <div className="flex flex-wrap align-between justify-evenly gap-2 sm:h-[288px] md:h-full">
            {track.synth.oscillators.map((osc) => (
              <OscillatorControls
                key={osc.id}
                active={active}
                oscillator={osc}
              />
            ))}
          </div>
        </div>
      </StudioDialog>
    );
  }
);
