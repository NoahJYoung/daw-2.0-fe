import { observer } from "mobx-react-lite";
import { UndoManager, undoMiddleware } from "mobx-keystone";
import { useEffect, useState } from "react";
import { useAudioEngine, AudioEngineProvider } from "./hooks";

export const Studio = observer(() => {
  const audioEngine = useAudioEngine();

  const [undoManager, setUndoManager] = useState<UndoManager | null>(null);

  useEffect(() => {
    setUndoManager(undoMiddleware(audioEngine));
  }, [audioEngine]);

  return (
    <AudioEngineProvider>
      <div>Test</div>
    </AudioEngineProvider>
  );
});
