import { Slider } from "@/components/ui/slider";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine, useDeferredUpdate } from "@/pages/studio/hooks";
import { Knob } from "@/components/ui/custom/studio/studio-knob";

interface TestComponentProps {
  track: Track;
}

export const ChannelStrip = observer(({ track }: TestComponentProps) => {
  const { mixer } = useAudioEngine();

  const {
    localValue: volumeInput,
    onValueChange: onVolumeChange,
    onValueCommit: commitVolumeChange,
  } = useDeferredUpdate<number[]>(
    [track.volume],
    (values) => track.setVolume(values[0]),
    [track.volume]
  );

  const {
    localValue: panInput,
    onValueChange: onPanChange,
    onValueCommit: commitPanChange,
  } = useDeferredUpdate<number>(track.pan, (value) => track.setPan(value), [
    track.pan,
  ]);

  const selected = mixer.selectedTracks.includes(track);

  const displayPercentage = (value: number) => {
    const percentage = Math.round(Math.abs(value) * 100);
    if (value < 0) {
      return `L${percentage}%`;
    }
    if (value > 0) {
      return `R${percentage}%`;
    }

    return `${percentage}%`;
  };

  const resetPan = () => track.setPan(0);

  return (
    <div
      className="flex flex-col items-center"
      style={{
        padding: 10,
        width: 120,
        height: 320,
        border: selected ? "2px solid red" : "1px solid #888",
      }}
    >
      <Button onClick={() => track.setActive(!track.active)}>
        {track.active ? "Deactivate" : "Activate"}
      </Button>

      <Input
        onChange={(e) => track.setName(e.target.value)}
        value={track.name}
      />
      <div className="flex w-full gap-1 items-center justify-between py-3">
        <p>L</p>
        <Knob
          onValueChange={onPanChange}
          onValueCommit={commitPanChange}
          renderValue={displayPercentage}
          onDoubleClick={resetPan}
          value={panInput}
          min={-1}
          max={1}
          step={0.02}
          size={36}
          double={true}
        />
        <p>R</p>
      </div>

      <Slider
        onValueChange={onVolumeChange}
        orientation="vertical"
        onValueCommit={commitVolumeChange}
        step={0.01}
        min={-100}
        max={0}
        value={volumeInput}
      />
    </div>
  );
});
