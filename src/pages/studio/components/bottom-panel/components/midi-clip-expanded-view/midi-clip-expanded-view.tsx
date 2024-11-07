import { MidiClip } from "@/pages/studio/audio-engine/components";
import { observer } from "mobx-react-lite";
import { PianoRoll, ToolBar } from "./components";

interface MidiClipExpandedViewProps {
  clip: MidiClip;
}

export const MidiClipExpandedView = observer(
  ({ clip }: MidiClipExpandedViewProps) => {
    return (
      <div className="flex flex-col gap-1 w-full h-[calc(100%-80px)] max-w-[1360px] flex-shrink-0 relative">
        <ToolBar clip={clip} />
        <PianoRoll clip={clip} />
      </div>
    );
  }
);
