import { MidiClip } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import * as Tone from "tone";

interface MidiClipExpandedViewProps {
  clip: MidiClip;
}

export const MidiClipExpandedView = observer(
  ({ clip }: MidiClipExpandedViewProps) => {
    return (
      <div className="flex flex-column gap-1">
        {clip.events.map((event, i) => (
          <span
            key={event.id}
            className="p-1 border border-surface-2 flex flex-column gap-1"
          >
            {i}
            <span className="align-items-center flex gap-1">
              <p>On:</p>
              <p>{Tone.Time(event.on, "samples").toSeconds().toFixed(3)}</p>
            </span>
            <span className="align-items-center flex gap-1">
              <p>Off:</p>
              <p>{Tone.Time(event.off, "samples").toSeconds().toFixed(3)}</p>
            </span>
          </span>
        ))}
      </div>
    );
  }
);
