import React from "react";

interface PlayheadProps {
  startPosition: number;
}

export const PianoRollPlayhead = React.forwardRef<
  HTMLSpanElement,
  PlayheadProps
>(({ startPosition }: PlayheadProps, ref) => (
  <span
    ref={ref}
    onClick={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    style={{
      top: 0,
      width: 1,
      height: 1910,
      zIndex: 40,
      pointerEvents: "none",
      transform: `translateX(${startPosition}px)`,
    }}
    className="absolute bg-surface-5"
  />
));
