import { NoteIconProps } from "../../note";
import { TripletMarker } from "../triplet-marker";

export const EighthNote = ({
  className = "",
  triplet = false,
}: NoteIconProps) => (
  <g className={className}>
    <ellipse
      cx="45"
      cy="80"
      rx="22"
      ry="15"
      transform="rotate(-15 35 70)"
      fill="currentColor"
    />
    <line x1="70" y1="76" x2="69" y2="25" strokeWidth="8" />
    <line x1="70" y1="22" x2="90" y2="27" strokeWidth="8" />

    {triplet && <TripletMarker />}
  </g>
);
