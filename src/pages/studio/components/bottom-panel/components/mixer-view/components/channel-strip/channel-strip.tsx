import { Slider } from "@/components/ui/slider";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Track } from "@/pages/studio/audio-engine/components";
import { useAudioEngine, useDeferredUpdate } from "@/pages/studio/hooks";

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
  } = useDeferredUpdate<number[]>(
    [track.pan],
    (values) => track.setPan(values[0]),
    [track.pan]
  );

  const selected = mixer.selectedTracks.includes(track);

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
      <div className="flex w-full gap-1 items-center">
        <p>L</p>
        <Slider
          onValueChange={onPanChange}
          onValueCommit={commitPanChange}
          value={panInput}
          min={-1}
          max={1}
          step={0.02}
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
