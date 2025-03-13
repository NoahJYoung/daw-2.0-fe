import { observer } from "mobx-react-lite";
import { EffectViewProps } from "../../../../types";
import { Reverb } from "@/pages/studio/audio-engine/components/effects";
import { useAudioEngine, useDeferredUpdate } from "@/pages/studio/hooks";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { NumberInput } from "../../../graphic-eq-view/components/band-controls/components";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

export const ReverbBottomView = observer(
  ({ effect: reverb, track }: EffectViewProps<Reverb>) => {
    const audioEngine = useAudioEngine();

    const { onValueChange: onWetChange, onValueCommit: onWetCommit } =
      useDeferredUpdate<number>(reverb.wet * 100, (value) => {
        reverb.setWet(Math.round(value) / 100);
      });

    const { onValueChange: onDecayChange, onValueCommit: onDecayCommit } =
      useDeferredUpdate<number>(reverb.decay, (value) =>
        reverb.setDecay(value)
      );

    const { wet, decay } = reverb;

    const [r, g, b] = track.rgb;
    const trackColor = `rgb(${r}, ${g}, ${b})`;

    const isDecayDisabled = [
      AudioEngineState.playing,
      AudioEngineState.recording,
    ].includes(audioEngine.state);

    const wetRange = [0, 100];
    const decayRange = [0.1, 5];

    return (
      <div className="flex flex-col w-full h-full items-center justify-between shadow-sm border rounded-md z-20 mt-1">
        <div className="w-full h-full flex items-center justify-evenly z-20">
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
              size={48}
              double={true}
              showValue={false}
            />

            <NumberInput
              min={wetRange[0]}
              max={wetRange[1]}
              step={1}
              value={Math.round(wet * 100)}
              onCommit={onWetCommit}
              suffix="%"
            />
          </span>

          <span className="flex flex-col items-center gap-3 p-2 text-surface-6 py-1 px-2 w-full">
            <span className="font-bold text-xs w-full">Decay</span>
            <Knob
              onValueChange={onDecayChange}
              onDoubleClick={() => reverb.setDecay(2.5)}
              onValueCommit={onDecayCommit}
              value={decay}
              min={decayRange[0]}
              max={decayRange[1]}
              step={0.01}
              color={trackColor}
              size={48}
              disabled={isDecayDisabled}
              double={true}
              showValue={false}
            />
            {isDecayDisabled ? (
              <span className="text-sm h-6 mt-1">{`${decay}s`}</span>
            ) : (
              <NumberInput
                step={0.01}
                min={decayRange[0]}
                max={decayRange[1]}
                value={decay}
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
