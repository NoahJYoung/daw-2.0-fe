interface PlayheadProps {
  left: number;
  height: number;
}

export const Playhead = ({ left, height }: PlayheadProps) => (
  <span
    id="playhead"
    style={{ left, top: 0, width: 1, height }}
    className="absolute bg-surface-5"
  />
);
