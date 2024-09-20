import { createContext, useContext, useMemo } from "react";
import { useAudioEngine } from "../use-audio-engine";
import { UndoManager, undoMiddleware, UndoStore } from "mobx-keystone";
import { MAX_UNDO_LEVELS } from "../../audio-engine/constants";

interface UseUndoManagerContextValue {
  undoManager: UndoManager;
  undoStore: UndoStore;
}

const AudioEngineContext = createContext<UseUndoManagerContextValue | null>(
  null
);

export const useUndoManager = (): UseUndoManagerContextValue => {
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
  const undoStore = useMemo(() => new UndoStore({}), []);
  const undoManager = useMemo(
    () =>
      undoMiddleware(audioEngine, undoStore, {
        maxUndoLevels: MAX_UNDO_LEVELS,
        maxRedoLevels: MAX_UNDO_LEVELS,
      }),
    [audioEngine]
  );

  const value = { undoManager, undoStore };

  return (
    <AudioEngineContext.Provider value={value}>
      {children}
    </AudioEngineContext.Provider>
  );
};
