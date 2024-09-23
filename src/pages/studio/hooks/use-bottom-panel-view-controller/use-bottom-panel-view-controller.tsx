import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useRef,
  useState,
  useEffect,
} from "react";
import { Track } from "../../audio-engine/components";
import { Clip } from "../../audio-engine/components/types";
import {
  ImperativePanelHandle,
  ImperativePanelGroupHandle,
} from "react-resizable-panels";

export type PanelMode = "MIXER" | "TRACK_FX" | "WAVEFORM_VIEW" | "PIANO_ROLL";

interface BottomPanelState {
  mode: PanelMode;
  selectedClip: Clip | null;
  selectedTrack: Track | null;
}

type BottomPanelAction =
  | { type: "SET_MODE"; payload: PanelMode }
  | { type: "SET_SELECTED_CLIP"; payload: Clip | null }
  | { type: "SET_SELECTED_TRACK"; payload: Track | null };

const initialState: BottomPanelState = {
  mode: "MIXER",
  selectedClip: null,
  selectedTrack: null,
};

const bottomPanelReducer = (
  state: BottomPanelState,
  action: BottomPanelAction
): BottomPanelState => {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };
    case "SET_SELECTED_CLIP":
      return { ...state, selectedClip: action.payload };
    case "SET_SELECTED_TRACK":
      return { ...state, selectedTrack: action.payload };
    default:
      return state;
  }
};

interface BottomPanelContextProps {
  mode: PanelMode;
  selectedTrack: Track | null;
  selectedClip: Clip | null;
  setMode: (mode: PanelMode) => void;
  selectClip: (clip: Clip) => void;
  selectTrack: (track: Track) => void;
  selectMixer: () => void;
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
  const [state, dispatch] = useReducer(bottomPanelReducer, initialState);

  const [windowSize, setWindowSize] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const topPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const getDefaultExpandDimensions = () => {
    if (windowSize.height <= 400) {
      return [0, 100];
    } else if (windowSize.height <= 800) {
      return [35, 65];
    } else return windowSize.width >= 640 ? [60, 40] : [35, 65];
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
    dispatch({ type: "SET_MODE", payload: mode });
  };

  const setSelectedClip = (clip: Clip | null) => {
    dispatch({ type: "SET_SELECTED_CLIP", payload: clip });
  };

  const setSelectedTrack = (track: Track | null) => {
    dispatch({ type: "SET_SELECTED_TRACK", payload: track });
  };

  const selectTrack = (track: Track) => {
    setSelectedTrack(track);
    if (state.selectedClip?.trackId !== track.id) {
      setSelectedClip(null);
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

  useEffect(() => {
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
    mode: state.mode,
    selectedTrack: state.selectedTrack,
    selectedClip: state.selectedClip,
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
