/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { AudioEngine } from "../../audio-engine";
import * as Tone from "tone";

type AudioEngineContextType = {
  engine: AudioEngine;
  toneStarted: boolean;
};

const AudioEngineContext = createContext<AudioEngineContextType | null>(null);

export const useAudioEngine = (): AudioEngine => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error(
      "useAudioEngine must be used within an AudioEngineProvider"
    );
  }
  return context.engine;
};

export const useAudioContextStarted = (): boolean => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error(
      "useAudioContextStarted must be used within an AudioEngineProvider"
    );
  }
  return context.toneStarted;
};

interface AudioEngineProviderProps {
  children: React.ReactNode;
}

export const AudioEngineProvider: React.FC<AudioEngineProviderProps> = ({
  children,
}) => {
  const audioEngine = useMemo(() => new AudioEngine({}), []);
  const [toneStarted, setToneStarted] = useState(false);
  const [hasAddedListeners, setHasAddedListeners] = useState(false);

  const startTone = useCallback(async () => {
    console.log("User interaction detected, attempting to start Tone.js");
    try {
      await Tone.start();
      console.log("Tone.js started successfully!");
      setToneStarted(true);

      if (audioEngine.init) {
        await audioEngine.init();
        console.log("Audio engine initialized");
      }
    } catch (error) {
      console.error("Failed to start Tone.js:", error);
    }
  }, [audioEngine]);

  useEffect(() => {
    if (hasAddedListeners || toneStarted) {
      return;
    }

    console.log("Adding user interaction listeners");

    const events = ["click", "touchstart", "keydown"];

    events.forEach((event) => {
      document.addEventListener(event, startTone, { once: true });
    });

    setHasAddedListeners(true);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, startTone);
      });
    };
  }, [startTone, hasAddedListeners, toneStarted]);

  useEffect(() => {
    if (toneStarted && hasAddedListeners) {
      console.log("Tone started, removing event listeners");
      const events = ["click", "touchstart", "keydown"];

      events.forEach((event) => {
        document.removeEventListener(event, startTone);
      });

      setHasAddedListeners(false);
    }
  }, [toneStarted, hasAddedListeners, startTone]);

  const contextValue = useMemo(
    () => ({
      engine: audioEngine,
      toneStarted,
    }),
    [audioEngine, toneStarted]
  );

  return (
    <AudioEngineContext.Provider value={contextValue}>
      {children}
    </AudioEngineContext.Provider>
  );
};
