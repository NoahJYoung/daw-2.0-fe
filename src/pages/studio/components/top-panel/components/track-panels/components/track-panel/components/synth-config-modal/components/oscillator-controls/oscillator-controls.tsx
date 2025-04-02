import { MeterFader } from "@/components/ui/custom/studio/meter-fader";
import { Knob } from "@/components/ui/custom/studio/studio-knob";
import { Oscillator } from "@/pages/studio/audio-engine/components/oscillator";
import { OscillatorType } from "@/pages/studio/audio-engine/components/oscillator/oscillator";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { IconType } from "react-icons/lib";
import {
  PiWaveSawtoothDuotone as SawtoothIcon,
  PiWaveSquareDuotone as SquareIcon,
  PiWaveTriangleDuotone as TriangleIcon,
  PiWaveSineDuotone as SineIcon,
} from "react-icons/pi";
import { useOscillatorControls } from "./hooks";
import { StudioButton } from "@/components/ui/custom/studio/studio-button";
import { isMobileDevice } from "@/pages/studio/utils";

const icons: Record<OscillatorType, IconType> = {
  sine: SineIcon,
  triangle: TriangleIcon,
  square: SquareIcon,
  sawtooth: SawtoothIcon,
};

interface OscillatorControlsProps {
  oscillator: Oscillator;
  active: boolean;
}

export const OscillatorControls = observer(
  ({ oscillator, active }: OscillatorControlsProps) => {
    const {
      onAttackChange,
      commitAttackChange,
      resetAttack,

      onReleaseChange,
      commitReleaseChange,
      resetRelease,

      onDecayChange,
      commitDecayChange,
      resetDecay,

      onSustainChange,
      commitSustainChange,
      resetSustain,
    } = useOscillatorControls(oscillator);

    const onVolumeChange = (value: number) => {
      oscillator.setVolume(value);
    };

    const Icon = useMemo(() => icons[oscillator.type], [oscillator.type]);

    const knobSize = isMobileDevice() ? 30 : 34;
    const faderHeight = isMobileDevice() ? 128 : 148;

    return (
      <div className="sm:w-[220px] md:w-[280px] flex gap-2 items-start justify-between text-surface-6 py-1 px-2 shadow-sm border rounded-md z-20">
        <div className="flex w-[128px] h-[128px] md:h-[170px] z-20">
          <MeterFader
            faderHeight={faderHeight}
            onChange={onVolumeChange}
            step={0.01}
            min={-60}
            max={6}
            value={oscillator.volume}
            meters={[oscillator.meter, oscillator.meter]}
            stopDelayMs={2000}
            active={active}
          />
        </div>
        <div className="z-20 flex flex-col w-[calc(100%-116px)] gap-0 sm:justify-start md:justify-evenly h-full md:p-2">
          <span className="w-full flex items-center justify-between">
            <StudioButton
              on={oscillator.mute}
              onClick={() => oscillator.setMute(!oscillator.mute)}
              label="M"
              onClassName="p-0 text-surface-10 border border-primary rounded-sm "
              className="p-0 rounded-sm focus-visible:ring-0 shadow-none text-sm relative flex items-center justify-center w-6 h-6 bg-transparent border border-surface-5 text-surface-5 hover:opacity-80 hover:bg-transparent"
            />
            <Icon className="text-2xl h-8 w-8" />
          </span>
          <span className="flex gap-1 w-full justify-between">
            <span className="flex flex-col items-center">
              <label className="text-xs">A</label>
              <Knob
                onValueChange={onAttackChange}
                onValueCommit={commitAttackChange}
                onDoubleClick={resetAttack}
                value={oscillator.attack}
                min={0}
                max={2}
                step={0.005}
                size={knobSize}
                minLabel="0s"
                maxLabel="2s"
                valuePosition="top"
              />
            </span>

            <span className="flex flex-col items-center">
              <label className="text-xs">D</label>
              <Knob
                onValueChange={onDecayChange}
                onValueCommit={commitDecayChange}
                onDoubleClick={resetDecay}
                value={oscillator.decay}
                min={0}
                max={2}
                step={0.005}
                size={knobSize}
                minLabel="0s"
                maxLabel="2s"
                valuePosition="top"
              />
            </span>
          </span>
          <span className="flex gap-1 w-full justify-between">
            <span className="flex flex-col items-center">
              <label className="text-xs">S</label>
              <Knob
                onValueChange={onSustainChange}
                onValueCommit={commitSustainChange}
                onDoubleClick={resetSustain}
                value={oscillator.sustain}
                min={0}
                max={1}
                step={0.005}
                size={knobSize}
                minLabel="0s"
                maxLabel="1s"
                valuePosition="top"
              />
            </span>

            <span className="flex flex-col items-center">
              <label className="text-xs">R</label>
              <Knob
                onValueChange={onReleaseChange}
                onValueCommit={commitReleaseChange}
                onDoubleClick={resetRelease}
                value={oscillator.release}
                min={0}
                max={2}
                step={0.005}
                size={knobSize}
                minLabel="0s"
                maxLabel="2s"
                valuePosition="top"
              />
            </span>
          </span>
        </div>
      </div>
    );
  }
);
