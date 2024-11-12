import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { Track } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { OscillatorControls } from "./components";
import { IconType } from "react-icons/lib";

interface SynthSettingsModalProps {
  track: Track;
  triggerIcon: IconType;
  triggerClassName: string;
}

export const SynthSettingsModal = observer(
  ({ track, triggerClassName, triggerIcon }: SynthSettingsModalProps) => (
    <StudioDialog
      title={`${track.name} - Synthesizer`}
      triggerIcon={triggerIcon}
      triggerClassName={triggerClassName}
    >
      <div className="flex flex-wrap justify-evenly gap-1 h-[324px]">
        {track.synth.oscillators.map((osc) => (
          <OscillatorControls oscillator={osc} />
        ))}
      </div>
    </StudioDialog>
  )
);
