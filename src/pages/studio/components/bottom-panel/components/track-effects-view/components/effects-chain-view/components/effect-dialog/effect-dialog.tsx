import { MonoMeterFader } from "@/components/ui/custom/studio/mono-meter-fader";
import { StudioDialog } from "@/components/ui/custom/studio/studio-dialog";
import { Track } from "@/pages/studio/audio-engine/components";
import { Effect } from "@/pages/studio/audio-engine/components/effect";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { IconType } from "react-icons/lib";
import { getEffectByKey } from "./helpers";

interface SynthSettingsModalProps {
  track: Track;
  effect: Effect;
  triggerIcon?: IconType;
}

const triggerClassName = `rounded-xxs focus-visible:ring-0 relative flex items-center justify-center p-1 w-full bg-surface-2 text-surface-7 hover:bg-surface-3`;

export const EffectDialog = observer(
  ({ effect, track, triggerIcon }: SynthSettingsModalProps) => {
    const { state } = useAudioEngine();

    const onInputVolumeChange = (value: number) => {
      effect.setInputVolume(value);
    };

    const onOutputVolumeChange = (value: number) => {
      effect.setOutputVolume(value);
    };

    const active =
      state === AudioEngineState.recording ||
      state === AudioEngineState.playing;

    const Effect = getEffectByKey(effect.name);
    return (
      <StudioDialog
        title={`${track.name} - ${effect.name} `}
        label={effect.name}
        triggerIcon={triggerIcon}
        triggerClassName={triggerClassName}
      >
        <div className="h-full flex flex-col gap-1 p-1">
          <div className="w-full h-1/2 shadow-sm border rounded-md p-2">
            {<Effect.Upper />}
          </div>
          <div className="flex items-center justify-between w-full h-1/2 p-1">
            <div className="w-[58px]">
              <MonoMeterFader
                faderHeight={156}
                onChange={onInputVolumeChange}
                step={0.01}
                min={-60}
                max={6}
                value={effect.inputVolume}
                meter={effect.inputMeter}
                stopDelayMs={2000}
                active={active}
              />
            </div>
            <div className="h-full w-[calc(100%-116px)]">
              {" "}
              {<Effect.Lower effect={effect} track={track} />}
            </div>
            <div className="w-[58px]">
              <MonoMeterFader
                faderHeight={156}
                onChange={onOutputVolumeChange}
                step={0.01}
                min={-60}
                max={6}
                value={effect.outputVolume}
                meter={effect.outputMeter}
                stopDelayMs={2000}
                active={active}
                orientation="right"
              />
            </div>
          </div>
        </div>
      </StudioDialog>
    );
  }
);
