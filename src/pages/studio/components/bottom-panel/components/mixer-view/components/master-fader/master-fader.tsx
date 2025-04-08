import { observer } from "mobx-react-lite";
import { useAudioEngine } from "@/pages/studio/hooks";
import { MeterFader } from "@/components/ui/custom/studio/meter-fader";
import { AudioEngineState } from "@/pages/studio/audio-engine/types";

export const MasterFader = observer(
  ({ mixerHeight }: { mixerHeight: number }) => {
    const { mixer, state } = useAudioEngine();
    const { master } = mixer;

    const onChange = (value: number) => {
      master.setVolume(value);
    };

    const active =
      state === AudioEngineState.recording ||
      state === AudioEngineState.playing;

    return (
      <div
        className={`flex flex-col flex-shrink-0 items-center bg-surface-2 border border-surface-1`}
        style={{
          width: 120,
          height: mixerHeight,
        }}
      >
        <div className="flex gap-1 items-center w-full py-1 border-b-2 border-surface-1 h-[36px] lg:h-8">
          <p className="text-lg text-surface-5 w-full text-center">Master</p>
        </div>

        <div className="h-full w-full">
          <MeterFader
            faderHeight={mixerHeight - 58}
            onChange={onChange}
            step={0.01}
            min={-60}
            max={6}
            value={master.volume}
            meters={[master.meterL, master.meterR]}
            stopDelayMs={2000}
            active={active}
          />
        </div>
      </div>
    );
  }
);
