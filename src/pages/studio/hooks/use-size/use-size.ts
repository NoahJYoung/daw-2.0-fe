import useResizeObserver from "@react-hook/resize-observer";
import { useState, useLayoutEffect } from "react";

export const useSize = (target: React.RefObject<HTMLDivElement>) => {
  const [size, setSize] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (target.current) {
      setSize(target.current.getBoundingClientRect());
    }
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};
