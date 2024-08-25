import { createContext, useContext, useMemo } from "react";
import { useAudioEngine } from "../use-audio-engine";
import { UndoManager, undoMiddleware } from "mobx-keystone";
import { MAX_UNDO_LEVELS } from "../../audio-engine/constants";

type UndoManagerContextType = UndoManager | null;

const AudioEngineContext = createContext<UndoManagerContextType>(null);

export const useUndoManager = (): UndoManager => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error(
      "useAudioEngine must be used within an ActionHistoryProvider"
    );
  }
  return context;
};

interface AudioEngineProviderProps {
  children: React.ReactNode;
}

export const UndoManagerProvider: React.FC<AudioEngineProviderProps> = ({
  children,
}) => {
  const audioEngine = useAudioEngine();
  const undoManager = useMemo(
    () =>
      undoMiddleware(audioEngine, undefined, {
        maxUndoLevels: MAX_UNDO_LEVELS,
        maxRedoLevels: MAX_UNDO_LEVELS,
      }),
    [audioEngine]
  );

  return (
    <AudioEngineContext.Provider value={undoManager}>
      {children}
    </AudioEngineContext.Provider>
  );
};
