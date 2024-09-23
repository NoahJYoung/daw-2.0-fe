import { useDeferredUpdate } from "@/pages/studio/hooks";
import { StudioSlider } from "@/components/ui/custom/studio/studio-slider";
import * as Tone from "tone";
import { LevelView, MeterView } from "./components";

interface MeterFaderProps {
  onChange: (value: number) => void;
  value: number;
  step: number;
  min: number;
  max: number;
  faderHeight: number;

  meters: Tone.Meter[];
  active?: boolean;
  selected?: boolean;
  stopDelayMs?: number;
}

export const MeterFader = ({
  onChange,
  value,
  min,
  max,
  step,
  meters,
  active,
  selected,
  stopDelayMs,
  faderHeight,
}: MeterFaderProps) => {
  const { onValueChange: onValueChange, onValueCommit: commitValueChange } =
    useDeferredUpdate<number[]>([value], (values) => onChange(values[0]));

  const [left, right] = meters;

  return (
    <div
      className={`h-full w-full flex justify-center h-full items-center items-center ${
        selected ? "bg-surface-3" : "bg-surface-2"
      } relative`}
    >
      <div
        style={{ height: faderHeight }}
        className="w-full flex absolute justify-center"
      >
        <LevelView height={faderHeight} />
        <MeterView
          height={faderHeight}
          width={20}
          stopDelayMs={stopDelayMs}
          active={active}
          meter={left}
        />

        <StudioSlider
          onValueChange={onValueChange}
          orientation="vertical"
          onValueCommit={commitValueChange}
          style={{ height: faderHeight }}
          step={step}
          min={min}
          max={max}
          value={[value]}
          showTrack={false}
        />

        <MeterView
          height={faderHeight}
          width={20}
          stopDelayMs={stopDelayMs}
          active={active}
          meter={right}
        />
      </div>
    </div>
  );
};
