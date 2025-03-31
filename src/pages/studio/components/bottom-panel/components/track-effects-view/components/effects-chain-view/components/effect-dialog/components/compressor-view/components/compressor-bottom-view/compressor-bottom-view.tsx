import { observer } from "mobx-react-lite";
import { EffectViewProps } from "../../../../types";
import { Compressor } from "@/pages/studio/audio-engine/components/effects";
import { useDeferredUpdate } from "@/pages/studio/hooks";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { NumberInput } from "../../../graphic-eq-view/components/band-controls/components";
import { clamp, type Range } from "../../../../helpers";
import { isMobileDevice } from "@/pages/studio/utils";

export const CompressorBottomView = observer(
  ({ effect: compressor, track }: EffectViewProps<Compressor>) => {
    const { attack, release, threshold, ratio, knee, makeupGain } = compressor;

    const attackRange: Range = [0, 1];
    const releaseRange: Range = [0, 1];
    const thresholdRange: Range = [-60, 0];
    const ratioRange: Range = [1, 20];
    const kneeRange: Range = [0, 40];
    const makeupGainRange: Range = [0, 12];

    const defaultAttack = 0.1;
    const defaultRelease = 0.2;
    const defaultThreshold = -20;
    const defaultRatio = 4;
    const defaultKnee = 0;
    const defaultMakeupGain = 1;

    const { onValueChange: onAttackChange, onValueCommit: onAttackCommit } =
      useDeferredUpdate<number>(attack, (value) => {
        compressor.setAttack(clamp(attackRange, value));
      });

    const { onValueChange: onReleaseChange, onValueCommit: onReleaseCommit } =
      useDeferredUpdate<number>(release, (value) => {
        compressor.setRelease(clamp(releaseRange, value));
      });

    const {
      onValueChange: onThresholdChange,
      onValueCommit: onThresholdCommit,
    } = useDeferredUpdate<number>(threshold, (value) => {
      compressor.setThreshold(clamp(thresholdRange, value));
    });

    const { onValueChange: onRatioChange, onValueCommit: onRatioCommit } =
      useDeferredUpdate<number>(ratio, (value) => {
        compressor.setRatio(clamp(ratioRange, value));
      });

    const { onValueChange: onKneeChange, onValueCommit: onKneeCommit } =
      useDeferredUpdate<number>(knee, (value) => {
        compressor.setKnee(clamp(kneeRange, value));
      });

    const {
      onValueChange: onMakeupGainChange,
      onValueCommit: onMakeupGainCommit,
    } = useDeferredUpdate<number>(makeupGain, (value) => {
      compressor.setMakeupGain(clamp(makeupGainRange, value));
    });

    const [r, g, b] = track.rgb;
    const trackColor = `rgb(${r}, ${g}, ${b})`;

    const knobSize = isMobileDevice() ? 34 : 40;

    return (
      <div className="flex flex-col w-full h-full items-center justify-between shadow-sm border rounded-md z-20 mt-1">
        <div className="w-full h-full flex justify-evenly z-20">
          <span className="mb-auto flex flex-col items-center gap-1 p-1 text-surface-6 py-1 px-1 w-full">
            <span className="font-bold text-xs w-full">Attack</span>
            <Knob
              onValueChange={onAttackChange}
              onDoubleClick={() => compressor.setAttack(defaultAttack)}
              onValueCommit={onAttackCommit}
              value={attack}
              min={attackRange[0]}
              max={attackRange[1]}
              step={0.01}
              color={trackColor}
              size={knobSize}
              showValue={false}
            />

            <NumberInput
              step={0.01}
              min={attackRange[0]}
              max={attackRange[1]}
              value={attack}
              allowDecimal
              width={knobSize}
              onCommit={onAttackCommit}
              suffix="s"
            />
          </span>
          <span className="mt-auto flex flex-col items-center gap-1 p-1 text-surface-6 py-1 px-1 w-full">
            <span className="font-bold text-xs w-full">Release</span>
            <Knob
              onValueChange={onReleaseChange}
              onDoubleClick={() => compressor.setRelease(defaultRelease)}
              onValueCommit={onReleaseCommit}
              value={release}
              min={releaseRange[0]}
              max={releaseRange[1]}
              step={0.01}
              color={trackColor}
              size={knobSize}
              showValue={false}
            />

            <NumberInput
              step={0.01}
              min={releaseRange[0]}
              max={releaseRange[1]}
              value={release}
              allowDecimal
              width={knobSize}
              onCommit={onReleaseCommit}
              suffix="s"
            />
          </span>
          <span className="mb-auto flex flex-col items-center gap-1 p-1 text-surface-6 py-1 px-1 w-full">
            <span className="font-bold text-xs w-full">Threshold</span>
            <Knob
              onValueChange={onThresholdChange}
              onDoubleClick={() => compressor.setThreshold(defaultThreshold)}
              onValueCommit={onThresholdCommit}
              value={threshold}
              min={thresholdRange[0]}
              max={thresholdRange[1]}
              step={0.1}
              color={trackColor}
              size={knobSize}
              showValue={false}
            />

            <NumberInput
              value={threshold}
              min={thresholdRange[0]}
              max={thresholdRange[1]}
              step={0.1}
              allowDecimal
              width={knobSize}
              onCommit={onThresholdCommit}
              suffix="dB"
            />
          </span>
          <span className="mt-auto flex flex-col items-center gap-1 p-1 text-surface-6 py-1 px-1 w-full">
            <span className="font-bold text-xs w-full">Ratio</span>
            <Knob
              onValueChange={onRatioChange}
              onDoubleClick={() => compressor.setRatio(defaultRatio)}
              onValueCommit={onRatioCommit}
              value={ratio}
              min={ratioRange[0]}
              max={ratioRange[1]}
              step={0.1}
              color={trackColor}
              size={knobSize}
              showValue={false}
            />

            <NumberInput
              value={ratio}
              min={ratioRange[0]}
              max={ratioRange[1]}
              step={0.1}
              allowDecimal
              width={knobSize}
              onCommit={onRatioCommit}
              suffix="dB"
            />
          </span>
          <span className="mb-auto flex flex-col items-center gap-1 p-1 text-surface-6 py-1 px-1 w-full">
            <span className="font-bold text-xs w-full">Knee</span>
            <Knob
              onValueChange={onKneeChange}
              onDoubleClick={() => compressor.setKnee(defaultKnee)}
              onValueCommit={onKneeCommit}
              value={knee}
              min={kneeRange[0]}
              max={kneeRange[1]}
              step={0.1}
              color={trackColor}
              size={knobSize}
              showValue={false}
            />

            <NumberInput
              value={knee}
              min={kneeRange[0]}
              max={kneeRange[1]}
              step={0.1}
              allowDecimal
              width={knobSize}
              onCommit={onKneeCommit}
              suffix="dB"
            />
          </span>
          <span className="mt-auto flex flex-col items-center gap-1 p-1 text-surface-6 py-1 px-1 w-full">
            <span className="font-bold text-xs w-full">Gain</span>
            <Knob
              onValueChange={onMakeupGainChange}
              onDoubleClick={() => compressor.setMakeupGain(defaultMakeupGain)}
              onValueCommit={onMakeupGainCommit}
              value={makeupGain}
              min={makeupGainRange[0]}
              max={makeupGainRange[1]}
              step={0.1}
              color={trackColor}
              size={knobSize}
              showValue={false}
            />

            <NumberInput
              value={makeupGain}
              min={makeupGainRange[0]}
              max={makeupGainRange[1]}
              step={0.1}
              width={knobSize}
              allowDecimal
              onCommit={onMakeupGainCommit}
              suffix="dB"
            />
          </span>
        </div>
      </div>
    );
  }
);
