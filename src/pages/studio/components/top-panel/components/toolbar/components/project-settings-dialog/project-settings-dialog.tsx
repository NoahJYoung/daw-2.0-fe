import { Button } from "@/components/ui/button";
import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { StudioDropdown } from "@/components/ui/custom/studio/studio-dropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { keys, timeSignatureOptions } from "@/pages/studio/audio-engine/types";
import { TimeSignatureIcon } from "@/pages/studio/components/main-controls/components/timeline-controls/components";
import { useAudioEngine, useUndoManager } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

interface ProjectSettingsDialogProps {
  open: boolean;
  onOpenChange: (state: boolean) => void;
}

export const ProjectSettingsDialog = observer(
  ({ open, onOpenChange }: ProjectSettingsDialogProps) => {
    const audioEngine = useAudioEngine();
    const { undoManager } = useUndoManager();
    const [projectName, setProjectName] = useState(audioEngine.projectName);
    const [audioLatency, setAudioLatency] = useLocalStorage(
      audioEngine.latencyCalibrator.audioLatencyStorageKey,
      0
    );
    const [midiLatency, setMidiLatency] = useLocalStorage(
      audioEngine.latencyCalibrator.midiNoteLatencyStorageKey,
      0
    );
    const [measures, setMeasures] = useState(audioEngine.timeline.measures);
    const [key, setKey] = useState(audioEngine.key);
    const [timeSignature, setTimeSignature] = useState(
      audioEngine.timeline.timeSignature
    );
    const [bpm, setBpm] = useState(audioEngine.timeline.bpm);

    const currentTimeSignatureValue = timeSignatureOptions
      .find((option) => parseFloat(option.value) === timeSignature)
      ?.label.split("/");

    const [upper, lower] = currentTimeSignatureValue?.map((string) =>
      parseInt(string)
    ) ?? [4, 4];

    const resetValues = useCallback(() => {
      setProjectName(audioEngine.projectName);
      setMeasures(audioEngine.timeline.measures);
      setKey(audioEngine.key);
      setTimeSignature(audioEngine.timeline.timeSignature);
      setBpm(audioEngine.timeline.bpm);
    }, [
      audioEngine.key,
      audioEngine.projectName,
      audioEngine.timeline.bpm,
      audioEngine.timeline.measures,
      audioEngine.timeline.timeSignature,
    ]);

    const handleOpenChange = (open: boolean) => {
      if (!open) {
        resetValues();
      }
      onOpenChange(open);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      undoManager.withGroup("SET PROJECT SETTINGS", () => {
        audioEngine.setProjectName(projectName);
        audioEngine.timeline.setMeasures(measures);
        audioEngine.setKey(key);
        audioEngine.timeline.setTimeSignature(timeSignature);
        audioEngine.timeline.setBpm(bpm);
      });
      onOpenChange(false);
    };

    useEffect(() => {
      resetValues();
    }, [open, resetValues]);

    return (
      <StudioDialog
        title="Project Settings"
        triggerClassName=""
        renderTrigger={false}
        open={open}
        onOpenChange={handleOpenChange}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-between gap-2 p-4 h-full"
        >
          <div className="flex flex-col gap-2 h-full">
            <div className="flex w-full justify-between">
              <span className="flex flex-col gap-1 p-1 w-4/5">
                <Label
                  className="whitespace-nowrap text-surface-6 text-sm "
                  htmlFor="projectName"
                >
                  Project Name:
                </Label>
                <Input
                  className="w-full rounded-xs h-10"
                  id="projectName"
                  name="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </span>

              <span className="flex flex-col gap-1 p-1 w-1/5">
                <Label
                  className="whitespace-nowrap text-surface-6 text-sm "
                  htmlFor="measures"
                >
                  Measures:
                </Label>
                <input
                  className="w-full h-10 text-surface-8 p-1 bg-transparent border border-surface-2 rounded-xs"
                  type="number"
                  id="measures"
                  name="measures"
                  value={measures}
                  onChange={(e) => setMeasures(parseInt(e.target.value))}
                  min={1}
                  max={1000}
                />
              </span>
            </div>
            <div className="flex w-full justify-between gap-1">
              <span className="flex flex-col gap-1 p-1 w-1/5">
                <Label
                  className="whitespace-nowrap text-surface-6 text-sm "
                  htmlFor="key"
                >
                  Key:
                </Label>
                <StudioDropdown
                  className="h-10"
                  id="key"
                  name="key"
                  options={keys.map((key) => ({
                    label: key.replace("b", "♭").replace("#", "♯"),
                    value: key,
                  }))}
                  value={key}
                  showSelectedValue={true}
                  size="lg"
                  colorOffset={0}
                  onChange={(value) => setKey(value)}
                />
              </span>
              <span className="flex justify-end flex-col gap-1 pb-[4px] w-1/5">
                <Button type="button" disabled className="h-10 rounded-xs">
                  Detect
                </Button>
              </span>

              <span className="flex flex-col gap-1 p-1 w-1/5 ml-auto">
                <Label className="whitespace-nowrap text-surface-6 text-sm">
                  Time Signature:
                </Label>
                <StudioDropdown
                  className="h-10"
                  options={timeSignatureOptions}
                  value={timeSignature.toString()}
                  showSelectedValue={false}
                  icon={
                    <TimeSignatureIcon
                      upper={upper}
                      lower={lower}
                      className="h-9 w-9 lg:h-9 lg:w-9 text-surface-5 fill-current"
                    />
                  }
                  size="lg"
                  colorOffset={0}
                  onChange={(value) => setTimeSignature(parseFloat(value))}
                />
              </span>
              <span className="flex flex-col gap-1 py-1 w-1/5">
                <Label
                  className="whitespace-nowrap text-surface-6 text-sm"
                  htmlFor="bpm"
                >
                  Bpm:
                </Label>
                <input
                  className="w-full h-10 text-surface-8 p-1 bg-transparent border border-surface-2 rounded-xs"
                  type="number"
                  id="bpm"
                  name="bpm"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  min={20}
                  max={600}
                />
              </span>
            </div>
            <div className="flex w-full gap-1">
              <span className="flex w-fit p-1 flex-col gap-1 py-1 w-1/5">
                <Label
                  className="whitespace-nowrap text-surface-6 text-sm"
                  htmlFor="audio_latency"
                >
                  {`Audio Latency (ms):`}
                </Label>
                <input
                  className="w-32 h-10 text-surface-8 p-1 bg-transparent border border-surface-2 rounded-xs"
                  type="number"
                  id="audio_latency"
                  name="audio_latency"
                  value={audioLatency}
                  onChange={(e) => setAudioLatency(parseInt(e.target.value))}
                />
              </span>

              <span className="flex p-1 w-fit flex-col gap-1 py-1 w-1/5">
                <Label
                  className="whitespace-nowrap text-surface-6 text-sm"
                  htmlFor="latency"
                >
                  {`Midi Note Offset (ms):`}
                </Label>
                <input
                  className="w-32 h-10 text-surface-8 p-1 bg-transparent border border-surface-2 rounded-xs"
                  type="number"
                  id="midi_latency"
                  name="midi_latency"
                  value={midiLatency}
                  onChange={(e) => setMidiLatency(parseInt(e.target.value))}
                />
              </span>
              <span className="flex justify-end flex-col gap-1 pb-[4px] w-1/5">
                <Button type="button" disabled className="h-10 rounded-xs">
                  Calibrate
                </Button>
              </span>
            </div>
          </div>

          <div className="w-full flex items-center justify-end gap-1">
            <Button
              type="submit"
              className="bg-surface-7 hover:bg-surface-8 text-surface-1 rounded-xs"
            >
              OK
            </Button>
          </div>
        </form>
      </StudioDialog>
    );
  }
);
