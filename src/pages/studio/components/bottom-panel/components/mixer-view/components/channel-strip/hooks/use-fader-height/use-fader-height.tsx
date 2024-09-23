import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";

interface FaderHeightContext {
  faderHeight: number | null;
  setFaderHeight: Dispatch<SetStateAction<number | null>>;
}

// Create a context for sharing the fader height
const FaderHeightContext = createContext<FaderHeightContext | undefined>(
  undefined
);

// A custom hook to use the context
export const useFaderHeight = () => {
  return useContext(FaderHeightContext);
};

// Provider to wrap around your components
export const FaderHeightProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [faderHeight, setFaderHeight] = useState<number | null>(null);

  return (
    <FaderHeightContext.Provider value={{ faderHeight, setFaderHeight }}>
      {children}
    </FaderHeightContext.Provider>
  );
};
