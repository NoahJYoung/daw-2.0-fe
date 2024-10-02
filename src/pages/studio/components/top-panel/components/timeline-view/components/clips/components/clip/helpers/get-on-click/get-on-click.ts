import { Timeline } from "@/pages/studio/audio-engine/components";
import { UndoManager } from "mobx-keystone";
import { SetStateAction } from "react";
import * as Tone from "tone";

export const getOnClick = (
  scrollRef: React.RefObject<HTMLDivElement>,
  timeline: Timeline,
  setPlayheadLeft: React.Dispatch<SetStateAction<number>>,
  undoManager: UndoManager
) => {
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey) {
      return;
    }
    undoManager.withoutUndo(() => {
      if (scrollRef.current) {
        const xOffset = scrollRef.current.getBoundingClientRect().x;
        const xValue = e.clientX - xOffset + scrollRef.current.scrollLeft;
        const seconds = timeline.snapToGrid
          ? Tone.Time(xValue * timeline.samplesPerPixel, "samples").quantize(
              timeline.subdivision
            )
          : Tone.Time(xValue * timeline.samplesPerPixel, "samples").toSeconds();
        Tone.getTransport().seconds = seconds;
        timeline.setSeconds(seconds);

        const pixels =
          Tone.Time(Tone.getTransport().seconds, "s").toSamples() /
          timeline.samplesPerPixel;
        setPlayheadLeft(pixels);
      }
    });
  };
  return onClick;
};
