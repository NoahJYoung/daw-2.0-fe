/* eslint-disable react-refresh/only-export-components */
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

const FaderHeightContext = createContext<FaderHeightContext | undefined>(
  undefined
);

export const useFaderHeight = () => {
  return useContext(FaderHeightContext);
};

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
