import { Slider } from "@/components/ui/slider";
import type { Track } from "../../audio-engine/components";
import { observer } from "mobx-react-lite";
import { Input } from "@/components/ui/input";
import { useAudioEngine } from "../../hooks";
import { Button } from "@/components/ui/button";

interface TestComponentProps {
  track: Track;
}

export const TestTrack = observer(({ track }: TestComponentProps) => {
  const { mixer } = useAudioEngine();

  const handlePanChange = (values: number[]) => {
    const [value] = values;
    track.setPan(value);
  };

  const handleVolumeChange = (value: number) => {
    track.setVolume(value);
  };

  const selected = mixer.selectedTracks.includes(track);

  return (
    <div
      className="flex flex-col"
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
          onValueChange={handlePanChange}
          value={[track.pan]}
          min={-1}
          max={1}
          step={0.02}
        />
        <p>R</p>
      </div>

      <input
        type="range"
        style={{ writingMode: "vertical-rl", direction: "rtl", height: "100%" }}
        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
        step={0.01}
        min={-100}
        max={0}
        value={track.volume}
      />
    </div>
  );
});
