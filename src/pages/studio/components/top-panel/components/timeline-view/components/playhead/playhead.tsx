interface PlayheadProps {
  left: number;
  height: number;
}

export const Playhead = ({ left, height }: PlayheadProps) => (
  <span
    style={{ left, top: 2, width: 1, height, zIndex: 11 }}
    className="absolute bg-surface-5"
  />
);
