import { useDeferredUpdate } from "@/pages/studio/hooks";
import { StudioSlider } from "@/components/ui/custom/studio/studio-slider";
import { MonoLevelView, MonoMeterView } from "./components";
import * as Tone from "tone";

interface MeterFaderProps {
  onChange: (value: number) => void;
  value: number;
  step: number;
  min: number;
  max: number;
  faderHeight: number;
  meter: Tone.Meter;
  active?: boolean;
  selected?: boolean;
  stopDelayMs?: number;
  orientation?: "left" | "right";
}

export const MonoMeterFader = ({
  onChange,
  value,
  min,
  max,
  step,
  meter,
  active,
  selected,
  stopDelayMs,
  faderHeight,
  orientation = "left",
}: MeterFaderProps) => {
  const { onValueChange: onValueChange, onValueCommit: commitValueChange } =
    useDeferredUpdate<number[]>([value], (values) => onChange(values[0]));

  return (
    <div
      className={`h-full w-full flex justify-center h-full z-20 items-center items-center ${
        selected ? "bg-transparent" : "bg-transparent"
      } relative`}
    >
      <div
        style={{ height: faderHeight }}
        className="w-[54px] flex absolute justify-center z-20"
      >
        <MonoLevelView
          orientation={orientation}
          height={Math.max(faderHeight, 0)}
        />
        <MonoMeterView
          height={faderHeight}
          width={20}
          stopDelayMs={stopDelayMs}
          active={active}
          meter={meter}
        />

        <StudioSlider
          className="z-20"
          onValueChange={onValueChange}
          orientation="vertical"
          thumbSize="sm"
          onValueCommit={commitValueChange}
          style={{ height: faderHeight }}
          step={step}
          min={min}
          max={max}
          value={[value]}
          showTrack={false}
        />
      </div>
    </div>
  );
};
