import React from "react";

interface PlayheadProps {
  height: number;
}

export const Playhead = React.forwardRef<HTMLSpanElement, PlayheadProps>(
  ({ height }: PlayheadProps, ref) => (
    <span
      ref={ref}
      onClick={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        left: 0,
        top: 2,
        width: 1,
        height,
        zIndex: 11,
        pointerEvents: "none",
        willChange: "transform",
      }}
      className="absolute bg-surface-5"
    />
  )
);
