/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from "react";
import { useAudioEngine } from "../use-audio-engine";
import { UndoManager, undoMiddleware, UndoStore } from "mobx-keystone";

interface UseUndoManagerContextValue {
  undoManager: UndoManager;
  undoStore: UndoStore;
}

const UndoManagerContext = createContext<UseUndoManagerContextValue | null>(
  null
);

export const useUndoManager = (): UseUndoManagerContextValue => {
  const context = useContext(UndoManagerContext);
  if (!context) {
    throw new Error(
      "useUndoManager must be used within an ActionHistoryProvider"
    );
  }
  return context;
};

interface UndoManagerProviderProps {
  children: React.ReactNode;
}

export const UndoManagerProvider: React.FC<UndoManagerProviderProps> = ({
  children,
}) => {
  const audioEngine = useAudioEngine();
  const undoStore = useMemo(() => new UndoStore({}), []);
  const undoManager = useMemo(
    () => undoMiddleware(audioEngine, undoStore),
    [audioEngine, undoStore]
  );

  const value = { undoManager, undoStore };

  return (
    <UndoManagerContext.Provider value={value}>
      {children}
    </UndoManagerContext.Provider>
  );
};
