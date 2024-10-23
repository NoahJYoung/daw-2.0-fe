import React, {
  createContext,
  useContext,
  ReactNode,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { Track } from "../../audio-engine/components";
import { Clip } from "../../audio-engine/components/types";
import {
  ImperativePanelHandle,
  ImperativePanelGroupHandle,
} from "react-resizable-panels";
import { useAudioEngine } from "../use-audio-engine";
import { PanelMode } from "../../audio-engine/components/detail-view-manager/types";

interface BottomPanelContextProps {
  toggleBottomPanel: () => void;
  topPanelRef: React.RefObject<ImperativePanelHandle>;
  bottomPanelRef: React.RefObject<ImperativePanelHandle>;
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle>;
  windowSize: { height: number; width: number };
}

const BottomPanelContext = createContext<BottomPanelContextProps | undefined>(
  undefined
);

export const useBottomPanelViewController = () => {
  const context = useContext(BottomPanelContext);
  if (!context) {
    throw new Error(
      "useBottomPanelViewController must be used within a BottomPanelProvider"
    );
  }
  return context;
};

export const BottomPanelProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { mixer } = useAudioEngine();

  const [windowSize, setWindowSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const topPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const getDefaultExpandDimensions = () => {
    if (windowSize.height <= 450) {
      return [0, 100];
    } else if (windowSize.height <= 800) {
      return [35, 65];
    } else return windowSize.width >= 640 ? [55, 45] : [35, 65];
  };

  const defaultExpandedDimensions = getDefaultExpandDimensions();

  const toggleBottomPanel = () => {
    if (panelGroupRef.current) {
      const currentLayout = panelGroupRef.current.getLayout();
      if (currentLayout[1] > 0) {
        panelGroupRef.current.setLayout([100, 0]);
      } else {
        panelGroupRef.current.setLayout(defaultExpandedDimensions);
      }
    }
  };

  const showBottomPanel = () => {
    if (panelGroupRef.current) {
      const currentLayout = panelGroupRef.current.getLayout();
      if (currentLayout[1] < 50) {
        panelGroupRef.current.setLayout(defaultExpandedDimensions);
      }
    }
  };

  const setMode = (mode: PanelMode) => {
    mixer.setPanelMode(mode);
  };

  const setSelectedClip = (clip: Clip) => {
    mixer.selectFeaturedClip(clip);
  };

  const setSelectedTrack = (track: Track) => {
    mixer.selectFeaturedTrack(track);
  };

  const selectTrack = (track: Track) => {
    setSelectedTrack(track);
    if (mixer.featuredClip?.trackId !== track.id) {
      mixer.unselectFeaturedClip();
    }
    setMode("TRACK_FX");
    showBottomPanel();
  };

  const selectClip = (clip: Clip) => {
    setSelectedClip(clip);
    setMode(clip.type === "audio" ? "WAVEFORM_VIEW" : "PIANO_ROLL");
    showBottomPanel();
  };

  const selectMixer = () => {
    setMode("MIXER");
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", () =>
      setWindowSize({
        height: window.innerHeight,
        width: window.innerWidth,
      })
    );
    return () =>
      window.removeEventListener("resize", () =>
        setWindowSize({
          height: window.innerHeight,
          width: window.innerWidth,
        })
      );
  }, []);

  const value = {
    setMode,
    selectClip,
    selectTrack,
    selectMixer,
    toggleBottomPanel,
    topPanelRef,
    bottomPanelRef,
    panelGroupRef,
    windowSize,
  };

  return (
    <BottomPanelContext.Provider value={value}>
      {children}
    </BottomPanelContext.Provider>
  );
};
