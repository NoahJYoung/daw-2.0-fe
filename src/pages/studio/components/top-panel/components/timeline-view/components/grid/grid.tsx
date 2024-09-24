import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { drawGrid, drawLanes } from "./helpers";

interface GridProps {
  totalWidth: number;
  subdivisionWidth: number;
  subdivisionsArray: number[];
  renderEveryFourthMeasure: boolean;
  measuresArray: number[];
  measureWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  startMeasure: number;
  endMeasure: number;
}

export const Grid = observer(
  ({
    subdivisionWidth,
    subdivisionsArray,
    measuresArray,
    measureWidth,
    renderEveryFourthMeasure,
    startMeasure,
    totalWidth,
    endMeasure,
  }: GridProps) => {
    const { mixer } = useAudioEngine();
    const { tracks } = mixer;
    const height = mixer.topPanelHeight;
    const className = "stroke-current text-surface-2";

    return (
      <svg
        className="border-r border-r-surface-2"
        width={totalWidth}
        height={height}
      >
        {drawLanes(className, totalWidth, tracks, mixer)}
        {drawGrid(
          className,
          measuresArray.slice(startMeasure, endMeasure),
          measureWidth,
          subdivisionsArray,
          subdivisionWidth,
          height,
          renderEveryFourthMeasure,
          startMeasure
        )}
      </svg>
    );
  }
);
