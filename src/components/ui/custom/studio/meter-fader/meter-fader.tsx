import { useDeferredUpdate } from "@/pages/studio/hooks";
import { StudioSlider } from "@/components/ui/custom/studio/studio-slider";
import { LevelView, MeterView } from "./components";
import * as Tone from "tone";

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
      style={{ height: faderHeight }}
      className={` w-full flex justify-center h-full z-20 items-center items-center ${
        selected ? "bg-transparent" : "bg-transparent"
      } relative`}
    >
      <div
        style={{ height: faderHeight }}
        className="w-full flex absolute justify-center z-20"
      >
        <LevelView height={Math.max(faderHeight, 0)} />
        <MeterView
          height={faderHeight}
          width={20}
          stopDelayMs={stopDelayMs}
          active={active}
          meter={left}
        />

        <StudioSlider
          className="z-20"
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
