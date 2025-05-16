import { NoteValue } from "@/pages/studio/audio-engine/components/timeline/types";
import { EighthNote } from "./components/eighth-note";
import { HalfNote } from "./components/half-note";
import { QuarterNote } from "./components/quarter-note";
import { SixteenthNote } from "./components/sixteenth-note";
import { WholeNote } from "./components/whole-note";

export interface NoteIconProps {
  className?: string;
  triplet?: boolean;
}

interface NoteProps {
  value: NoteValue;
  className?: string;
}

export const Note = ({ className = "", value }: NoteProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className={className}
    stroke="currentColor"
    strokeWidth="8"
    fill="transparent"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {(() => {
      switch (value) {
        case "1n":
          return <WholeNote className={className} />;
        case "2n":
          return <HalfNote className={className} />;
        case "2t":
          return <HalfNote className={className} triplet />;
        case "4n":
          return <QuarterNote className={className} />;
        case "4t":
          return <QuarterNote className={className} triplet />;
        case "8n":
          return <EighthNote className={className} />;
        case "8t":
          return <EighthNote className={className} triplet />;
        case "16n":
          return <SixteenthNote className={className} />;
        case "16t":
          return <SixteenthNote className={className} triplet />;
      }
    })()}
  </svg>
);
