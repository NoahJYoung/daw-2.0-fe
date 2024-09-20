import { useDeferredUpdate } from "@/pages/studio/hooks";
import { StudioSlider } from "@/components/ui/custom/studio/studio-slider";
import * as Tone from "tone";
import { MeterView } from "./components";
import { useRef } from "react";

interface MeterFaderProps {
  onChange: (value: number) => void;
  value: number;
  step: number;
  min: number;
  max: number;
  meter: Tone.Meter;
  active?: boolean;
  stopDelayMs?: number;
}

export const MeterFader = ({
  onChange,
  value,
  min,
  max,
  step,
  meter,
  active,
  stopDelayMs,
}: MeterFaderProps) => {
  const {
    // localValue,
    onValueChange: onValueChange,
    onValueCommit: commitValueChange,
  } = useDeferredUpdate<number[]>([value], (values) => onChange(values[0]));
  const faderContainerRef = useRef<HTMLDivElement>(null);

  const height = faderContainerRef.current?.getBoundingClientRect().height || 0;
  const width = faderContainerRef.current?.getBoundingClientRect().width || 0;

  return (
    <div
      ref={faderContainerRef}
      className={`h-full w-full flex justify-center items-center gap-1 flex-shrink-0 items-center bg-surface-2`}
      style={{
        width: 90,
        height: "100%",
      }}
    >
      <StudioSlider
        onValueChange={onValueChange}
        orientation="vertical"
        onValueCommit={commitValueChange}
        step={step}
        min={min}
        max={max}
        value={[value]}
      />
      <MeterView
        height={height}
        width={width / 8}
        stopDelayMs={stopDelayMs}
        active={active}
        meter={meter}
      />
    </div>
  );
};
