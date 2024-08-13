import { observer } from "mobx-react-lite";
import { AudioEngine } from "./audio-engine";
import { Button } from "@/components/ui/button";
import { UndoManager, undoMiddleware } from "mobx-keystone";
import { useEffect, useState } from "react";
import { Clip, exampleTrack, Track } from "./audio-engine/audio-engine";

export const Studio = observer(() => {
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null);
  const [undoManager, setUndoManager] = useState<UndoManager | null>(null);

  const undo = () => {
    if (undoManager?.canUndo) {
      undoManager?.undo();
    }
  };

  const redo = () => {
    if (undoManager?.canRedo) {
      undoManager?.redo();
    }
  };

  useEffect(() => {
    const clip = new Clip({ text: "test text" });
    const track = new Track({ clips: [clip] });
    const engine = new AudioEngine({
      text: "Test text",
      tracks: [track],
    });
    setAudioEngine(engine);
    setUndoManager(undoMiddleware(engine));
  }, []);

  return (
    <div>
      <span>{audioEngine?.tracks?.[0]?.clips?.[0].text}</span>
      <Button
        onClick={() => {
          audioEngine?.tracks?.[0]?.clips?.[0].setText(
            "did the component rerender?"
          );
        }}
      >
        Click me
      </Button>
      <Button
        disabled={!undoManager?.canUndo}
        variant={"secondary"}
        onClick={undo}
      >
        Undo
      </Button>
      <Button
        disabled={!undoManager?.canRedo}
        variant={"secondary"}
        onClick={redo}
      >
        redo
      </Button>
    </div>
  );
});
