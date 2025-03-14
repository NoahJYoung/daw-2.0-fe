import { observer } from "mobx-react-lite";
import { EffectViewProps } from "../../../../types";
import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { useAudioEngine, useDeferredUpdate } from "@/pages/studio/hooks";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { NumberInput } from "../../../graphic-eq-view/components/band-controls/components";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";
import { clamp, type Range } from "../../../../helpers";
import { useState } from "react";

export const ReverbBottomView = observer(
  ({ effect: reverb, track }: EffectViewProps<Reverb>) => {
    const audioEngine = useAudioEngine();
    const { wet, decay, preDelay } = reverb;
    const [localPreDelayValue, setLocalPreDelayValue] = useState(preDelay);
    const [localDecayValue, setLocalDecayValue] = useState(decay);
    const wetRange: Range = [0, 100];
    const decayRange: Range = [0.1, 5];
    const preDelayRange: Range = [0, 1];

    const { onValueChange: onWetChange, onValueCommit: onWetCommit } =
      useDeferredUpdate<number>(reverb.wet * 100, (value) => {
        reverb.setWet(Math.round(value) / 100);
      });

    const onPreDelayChange = (value: number) => {
      setLocalPreDelayValue(value);
    };

    const onPreDelayCommit = (value: number) => {
      const clampedValue = clamp(preDelayRange, value);
      reverb.setPreDelay(clampedValue);
      setLocalPreDelayValue(clampedValue);
    };

    const onDecayChange = (value: number) => {
      setLocalDecayValue(value);
    };

    const onDecayCommit = (value: number) => {
      const clampedValue = clamp(decayRange, value);
      reverb.setDecay(clampedValue);
      setLocalDecayValue(clampedValue);
    };

    const [r, g, b] = track.rgb;
    const trackColor = `rgb(${r}, ${g}, ${b})`;

    const disabled = [
      AudioEngineState.playing,
      AudioEngineState.recording,
    ].includes(audioEngine.state);

    return (
      <div className="flex flex-col w-full h-full items-center justify-between shadow-sm border rounded-md z-20 mt-1">
        <div className="w-full h-full flex items-center justify-evenly z-20">
          <span className="flex flex-col items-center gap-3 p-2 text-surface-6 py-1 px-2 w-full">
            <span className="font-bold text-xs w-full">Pre Delay</span>
            <Knob
              onValueChange={onPreDelayChange}
              onDoubleClick={() => reverb.setPreDelay(0.1)}
              onValueCommit={onPreDelayCommit}
              value={localPreDelayValue}
              min={preDelayRange[0]}
              max={preDelayRange[1]}
              step={0.01}
              color={trackColor}
              size={44}
              disabled={disabled}
              showValue={false}
            />
            {disabled ? (
              <span className="text-sm h-6 mt-1">{`${preDelay}s`}</span>
            ) : (
              <NumberInput
                step={0.01}
                min={preDelayRange[0]}
                max={preDelayRange[1]}
                value={localPreDelayValue}
                allowDecimal
                onCommit={onPreDelayCommit}
                suffix="s"
              />
            )}
          </span>

          <span className="flex flex-col items-center gap-3 p-2 text-surface-6 py-1 px-2 w-full">
            <span className="font-bold text-xs w-full">Wet</span>
            <Knob
              onValueChange={onWetChange}
              onDoubleClick={() => reverb.setWet(1)}
              onValueCommit={onWetCommit}
              value={Math.round(wet * 100)}
              min={wetRange[0]}
              max={wetRange[1]}
              color={trackColor}
              step={1}
              size={44}
              showValue={false}
            />

            <NumberInput
              min={wetRange[0]}
              max={wetRange[1]}
              step={1}
              value={Math.round(wet * 100)}
              onCommit={(value) => onWetCommit(clamp(wetRange, value))}
              suffix="%"
            />
          </span>

          <span className="flex flex-col items-center gap-3 p-2 text-surface-6 py-1 px-2 w-full">
            <span className="font-bold text-xs w-full">Decay</span>
            <Knob
              onValueChange={onDecayChange}
              onDoubleClick={() => reverb.setDecay(2.5)}
              onValueCommit={onDecayCommit}
              value={localDecayValue}
              min={decayRange[0]}
              max={decayRange[1]}
              step={0.01}
              color={trackColor}
              size={44}
              disabled={disabled}
              showValue={false}
            />
            {disabled ? (
              <span className="text-sm h-6 mt-1">{`${decay}s`}</span>
            ) : (
              <NumberInput
                step={0.01}
                min={decayRange[0]}
                max={decayRange[1]}
                value={localDecayValue}
                allowDecimal
                onCommit={onDecayCommit}
                suffix="s"
              />
            )}
          </span>
        </div>
      </div>
    );
  }
);
