import { Button } from "@/components/ui/button";
import { useUndoManager, useAudioEngine } from "../../hooks";
import { observer } from "mobx-react-lite";
import { TestTrack } from "./test-track";
import * as Tone from "tone";

export const TestComponent = observer(() => {
  const audioEngine = useAudioEngine();
  const undoManager = useUndoManager();

  const setBpm = (newBpm: number) => audioEngine.transport.setBpm(newBpm);

  const undo = () => {
    if (undoManager.canUndo) {
      undoManager.undo();
    }
  };

  const redo = () => {
    if (undoManager.canRedo) {
      undoManager.redo();
    }
  };

  if (audioEngine.mixer.tracks.length) {
    console.log("CLIPS", audioEngine.mixer.tracks[0].clips);
  }

  return (
    <div
      onClick={(e) => {
        undoManager.withoutUndo(() =>
          audioEngine.transport.setTicksFromPixels(e.clientX)
        );
      }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center gap-1">
        <Button onClick={() => setBpm(audioEngine.transport.bpm - 1)}>-</Button>
        <span>{audioEngine.transport.bpm}</span>
        <Button onClick={() => setBpm(audioEngine.transport.bpm + 1)}>+</Button>
        <Button disabled={!undoManager.canUndo} onClick={undo}>
          Undo
        </Button>
        <Button disabled={!undoManager.canRedo} onClick={redo}>
          Redo
        </Button>
        <Button onClick={audioEngine.mixer.createTrack}>Add Track</Button>
        <Button onClick={() => console.log(audioEngine.serialize())}>
          Get Snapshot
        </Button>
        <Button onClick={() => audioEngine.mockRecord()}>Record</Button>
        <Button onClick={Tone.start}>Start</Button>
      </div>

      <div className="flex gap-1">
        {audioEngine.mixer.tracks.map((track) => (
          <TestTrack key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
});
