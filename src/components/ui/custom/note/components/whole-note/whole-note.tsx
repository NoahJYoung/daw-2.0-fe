import { NoteIconProps } from "../../note";

export const WholeNote = ({ className = "" }: NoteIconProps) => (
  <g className={className}>
    <ellipse cx="45" cy="60" rx="27" ry="18" transform="rotate(-15 50 50)" />
  </g>
);
