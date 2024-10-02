import { useRef, useLayoutEffect } from "react";

interface UseRequestAnimationFrameOptions {
  enabled?: boolean;
}

export const useRequestAnimationFrame = (
  callback: (deltaTime: number) => void,
  options: UseRequestAnimationFrameOptions = { enabled: true }
) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const { enabled } = options;

  useLayoutEffect(() => {
    if (!enabled) {
      return;
    }
    const animate = (time: number) => {
      if (previousTimeRef.current != undefined) {
        const deltaTime = time - previousTimeRef.current;
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback, enabled]);
};
