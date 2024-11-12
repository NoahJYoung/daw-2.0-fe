import { MeterFader } from "@/components/ui/custom/studio/meter-fader";
import { Oscillator } from "@/pages/studio/audio-engine/components/oscillator";
import { OscillatorType } from "@/pages/studio/audio-engine/components/oscillator/oscillator";
import { observer } from "mobx-react-lite";
import { IconType } from "react-icons/lib";
import {
  PiWaveSawtoothDuotone as SawtoothIcon,
  PiWaveSquareDuotone as SquareIcon,
  PiWaveTriangleDuotone as TriangleIcon,
  PiWaveSineDuotone as SineIcon,
} from "react-icons/pi";

const icons: Record<OscillatorType, IconType> = {
  sine: SineIcon,
  triangle: TriangleIcon,
  square: SquareIcon,
  sawtooth: SawtoothIcon,
};

interface OscillatorControlsProps {
  oscillator: Oscillator;
}

export const OscillatorControls = observer(
  ({ oscillator }: OscillatorControlsProps) => {
    const onVolumeChange = (value: number) => {
      oscillator.setVolume(value);
    };

    const Icon = icons[oscillator.type];

    return (
      <div className="w-[220px] flex gap-2 items-start justify-between text-surface-6 p-1 shadow-sm border rounded-md">
        {/* <span className="w-full"> */}
        {/* <Icon className="text-2xl h-8 w-8" /> */}
        {/* </span> */}
        <div className="w-[116px] h-[148px]">
          <MeterFader
            faderHeight={148}
            onChange={onVolumeChange}
            step={0.01}
            min={-60}
            max={6}
            value={oscillator.volume}
            meters={[oscillator.meter, oscillator.meter]}
            stopDelayMs={2000}
            active
          />
        </div>
        <Icon className="text-2xl h-8 w-8" />
      </div>
    );
  }
);
