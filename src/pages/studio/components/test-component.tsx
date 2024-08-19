import { Button } from "@/components/ui/button";
import { useUndoManager, useAudioEngine } from "../hooks";
import { observer } from "mobx-react-lite";

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

  console.log(audioEngine.serialize());

  return (
    <div
      onClick={(e) => {
        undoManager.withoutUndo(() =>
          audioEngine.transport.setTicksFromPixels(e.clientX)
        );
      }}
      className="flex items-center"
    >
      <Button onClick={() => setBpm(audioEngine.transport.bpm - 1)}>-</Button>
      <span>{audioEngine.transport.bpm}</span>
      <Button onClick={() => setBpm(audioEngine.transport.bpm + 1)}>+</Button>
      <Button disabled={!undoManager.canUndo} onClick={undo}>
        Undo
      </Button>
      <Button disabled={!undoManager.canRedo} onClick={redo}>
        Redo
      </Button>
      <Button onClick={audioEngine.createTrack}>Add Track</Button>
      {audioEngine.tracks.map((track) => (
        <div key={track.id} className="flex flex-col">
          <span>{track.name}</span>
          <span>{track.id}</span>
        </div>
      ))}
    </div>
  );
});
