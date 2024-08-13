import { createContext, useContext, useMemo } from "react";
import { AudioEngine } from "../../audio-engine";

type AudioEngineContextType = AudioEngine | null;

const AudioEngineContext = createContext<AudioEngineContextType>(null);

export const useAudioEngine = (): AudioEngine => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error(
      "useAudioEngine must be used within an AudioEngineProvider"
    );
  }
  return context;
};

interface AudioEngineProviderProps {
  children: React.ReactNode;
}

export const AudioEngineProvider: React.FC<AudioEngineProviderProps> = ({
  children,
}) => {
  const audioEngine = useMemo(() => new AudioEngine({}), []);

  return (
    <AudioEngineContext.Provider value={audioEngine}>
      {children}
    </AudioEngineContext.Provider>
  );
};
