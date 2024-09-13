interface PlayheadProps {
  left: number;
  height: number;
}

export const Playhead = ({ left, height }: PlayheadProps) => (
  <span
    onClick={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    style={{
      left,
      top: 2,
      width: 1,
      height,
      zIndex: 11,
      pointerEvents: "none",
    }}
    className="absolute bg-surface-5"
  />
);
