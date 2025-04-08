import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { Band } from "@/pages/studio/audio-engine/components/effects/graphic-eq/components";
import { useDeferredUpdate } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { NumberInput } from "./components";
import { Track } from "@/pages/studio/audio-engine/components";
import { clamp } from "../../../../helpers";

interface BandControlsProps {
  band: Band;
  track: Track;
}

export const BandControls = observer(({ band, track }: BandControlsProps) => {
  const { onValueChange: onGainChange, onValueCommit: onGainCommit } =
    useDeferredUpdate<number>(band.gain, (value) => band.setGain(value));

  const { onValueChange: onFreqChange, onValueCommit: onFreqCommit } =
    useDeferredUpdate<number>(band.frequency, (value) =>
      band.setFrequency(value)
    );

  const { onValueChange: onQChange, onValueCommit: onQCommit } =
    useDeferredUpdate<number>(band.Q, (value) => band.setQ(value));

  const freqMin = 20;
  const freqMax = 20000;

  const linearToLog = (value: number) => {
    const logMin = Math.log(freqMin);
    const logMax = Math.log(freqMax);
    const scale = logMax - logMin;
    return Math.round(Math.exp(logMin + scale * value));
  };

  const logToLinear = (frequency: number) => {
    const logMin = Math.log(freqMin);
    const logMax = Math.log(freqMax);
    return (Math.log(frequency) - logMin) / (logMax - logMin);
  };

  const [r, g, b] = track.rgb;
  const trackColor = `rgb(${r}, ${g}, ${b})`;

  const isQDisabled = ["highshelf", "highpass"].includes(band.type);
  const isGainDisabled = ["highpass"].includes(band.type);

  return (
    <div className="w-full lg:h-full flex items-center justify-evenly shadow-sm border rounded-md z-20 mt-1">
      <span className="flex flex-col items-center gap-1 p-1 lg:gap-3 lg:p-2 text-surface-6 py-1 px-2 w-full">
        <span className="font-bold text-xs w-full">Frequency</span>
        <Knob
          onValueChange={(value) => onFreqChange(linearToLog(value))}
          onValueCommit={(value) => onFreqCommit(linearToLog(value))}
          value={logToLinear(band.frequency)}
          min={0}
          max={1}
          step={0.01}
          color={trackColor}
          size={40}
          showValue={false}
        />
        <NumberInput
          min={freqMin}
          max={freqMax}
          value={band.frequency}
          onCommit={(value) => onFreqCommit(clamp([freqMin, freqMax], value))}
          suffix="Hz"
        />
      </span>

      <span className="flex flex-col items-center gap-3 p-2 text-surface-6 py-1 px-2 w-full">
        <span className="font-bold text-xs w-full">Gain</span>
        <Knob
          onValueChange={(value) => onGainChange(value)}
          onValueCommit={(value) => onGainCommit(value)}
          value={band.gain}
          min={-10}
          max={10}
          color={trackColor}
          step={0.01}
          size={40}
          double={true}
          disabled={isGainDisabled}
          showValue={false}
        />
        {!isGainDisabled ? (
          <NumberInput
            min={-10.0}
            max={10.0}
            step={0.01}
            value={band.gain}
            allowDecimal
            onCommit={(value) => onGainCommit(clamp([-10, 10], value))}
            suffix="dB"
          />
        ) : (
          <span className="text-sm" style={{ marginTop: "0.5rem" }}>
            N/A
          </span>
        )}
      </span>

      <span className="flex flex-col items-center gap-3 p-2 text-surface-6 py-1 px-2 w-full">
        <span className="font-bold text-xs w-full">Q</span>
        <Knob
          onValueChange={(value) => onQChange(value)}
          onValueCommit={(value) => onQCommit(value)}
          value={band.Q}
          min={0.01}
          max={10}
          step={0.01}
          color={trackColor}
          size={40}
          double={true}
          disabled={isQDisabled}
          showValue={false}
        />
        {!isQDisabled ? (
          <NumberInput
            step={0.01}
            min={0.01}
            max={10}
            value={band.Q}
            allowDecimal
            onCommit={(value) => onQCommit(clamp([0.01, 10], value))}
          />
        ) : (
          <span className="text-sm" style={{ marginTop: "0.5rem" }}>
            N/A
          </span>
        )}
      </span>
    </div>
  );
});
