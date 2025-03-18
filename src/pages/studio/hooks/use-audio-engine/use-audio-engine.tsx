/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo } from "react";
import { AudioEngine } from "../../audio-engine";
import { useParams } from "react-router-dom";
import demoProject from "../../utils/sampleProject.json";

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
  const { projectId } = useParams();
  const audioEngine = useMemo(() => new AudioEngine({}), []);

  useEffect(() => {
    const initializeDemoProject = async () => {
      audioEngine.loadProjectData(demoProject);
    };

    if (!projectId) {
      initializeDemoProject();
    }
  }, [audioEngine, projectId]);

  return (
    <AudioEngineContext.Provider value={audioEngine}>
      {children}
    </AudioEngineContext.Provider>
  );
};
