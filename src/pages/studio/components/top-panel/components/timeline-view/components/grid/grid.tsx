import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { drawGrid, drawLanes } from "./helpers";

interface GridProps {
  subdivisionWidth: number;
  subdivisionsArray: number[];
  renderEveryFourthMeasure: boolean;
  measuresArray: number[];
  measureWidth: number;
}

export const Grid = observer(
  ({
    subdivisionWidth,
    subdivisionsArray,
    measuresArray,
    measureWidth,
    renderEveryFourthMeasure,
  }: GridProps) => {
    const { timeline, mixer } = useAudioEngine();
    const { tracks } = mixer;
    const width = timeline.pixels;
    const height = mixer.topPanelHeight;
    const className = "stroke-current text-surface-2";

    return (
      <svg width={width} height={height}>
        {drawLanes(className, width, tracks, mixer)}
        {drawGrid(
          className,
          measuresArray,
          measureWidth,
          subdivisionsArray,
          subdivisionWidth,
          height,
          renderEveryFourthMeasure
        )}
      </svg>
    );
  }
);
