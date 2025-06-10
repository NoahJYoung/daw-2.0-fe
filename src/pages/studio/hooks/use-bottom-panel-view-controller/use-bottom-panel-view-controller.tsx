/* eslint-disable react-refresh/only-export-components */
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
import { useUndoManager } from "../use-undo-manager";
import { PanelMode } from "../../audio-engine/components/mixer/types";
import { isMobileDevice } from "../../utils";

interface BottomPanelContextProps {
  toggleBottomPanel: () => void;
  topPanelRef: React.RefObject<ImperativePanelHandle>;
  bottomPanelRef: React.RefObject<ImperativePanelHandle>;
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle>;
  windowSize: { height: number; width: number };
}

interface BottomPanelContextProps {
  setMode: (mode: PanelMode) => void;
  selectClip: (clip: Clip) => void;
  selectTrack: (track: Track) => void;
  selectMixer: () => void;
  toggleBottomPanel: () => void;
  expandBottomPanelIfCollapsed: () => void;
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
  const { undoManager } = useUndoManager();

  const [windowSize, setWindowSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const topPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const isMobile = isMobileDevice();
  const isLandscape = isMobile && window.innerWidth > window.innerHeight;

  const getDefaultExpandDimensions = () => {
    if (isMobile) {
      if (isLandscape) {
        return [0, 100];
      } else {
        return [50, 50];
      }
    } else if (windowSize.height <= 800) {
      return [30, 70];
    } else return windowSize.width >= 640 ? [55, 45] : [35, 65];
  };

  const defaultExpandedDimensions = getDefaultExpandDimensions();

  const toggleBottomPanel = () => {
    if (panelGroupRef.current) {
      const currentLayout = panelGroupRef.current.getLayout();
      if (isMobile && !isLandscape) {
        if (currentLayout[1] > 0) {
          if (currentLayout[1] < 100) {
            panelGroupRef.current.setLayout([0, 100]);
          } else {
            panelGroupRef.current.setLayout([100, 0]);
          }
        } else {
          panelGroupRef.current.setLayout(defaultExpandedDimensions);
        }
      } else {
        if (currentLayout[1] > 0) {
          panelGroupRef.current.setLayout([100, 0]);
        } else {
          panelGroupRef.current.setLayout(defaultExpandedDimensions);
        }
      }
    }
  };

  const expandBottomPanelIfCollapsed = () => {
    if (panelGroupRef.current) {
      const currentLayout = panelGroupRef.current.getLayout();
      if (currentLayout[1] === 0) {
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
    undoManager.withoutUndo(() => mixer.setPanelMode(mode));
  };

  const setSelectedClip = (clip: Clip) => {
    undoManager.withoutUndo(() => mixer.selectFeaturedClip(clip));
  };

  const setSelectedTrack = (track: Track) => {
    undoManager.withoutUndo(() => mixer.selectFeaturedTrack(track));
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

  const updateDimensions = () => {
    setWindowSize({
      height: window.innerHeight,
      width: window.innerWidth,
    });
  };

  useLayoutEffect(() => {
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("orientationchange", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("orientationchange", updateDimensions);
    };
  }, []);

  const value = {
    setMode,
    selectClip,
    selectTrack,
    selectMixer,
    toggleBottomPanel,
    expandBottomPanelIfCollapsed,
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
