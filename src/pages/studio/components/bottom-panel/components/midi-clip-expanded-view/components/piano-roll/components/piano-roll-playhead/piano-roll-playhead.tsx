interface PlayheadProps {
  left: number;
}

export const PianoRollPlayhead = ({ left }: PlayheadProps) => (
  <span
    onClick={(e) => e.preventDefault()}
    onContextMenu={(e) => e.preventDefault()}
    style={{
      left,
      top: 0,
      width: 1,
      height: 1910,
      zIndex: 40,
      pointerEvents: "none",
    }}
    className="absolute bg-surface-5"
  />
);
