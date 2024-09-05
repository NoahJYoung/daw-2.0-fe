import { useAudioEngine } from "@/pages/studio/hooks";
import { observer } from "mobx-react-lite";
import { drawGrid, drawLanes } from "./helpers";
import { useState, useEffect, useCallback } from "react";

interface GridProps {
  subdivisionWidth: number;
  subdivisionsArray: number[];
  renderEveryFourthMeasure: boolean;
  measuresArray: number[];
  measureWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const Grid = observer(
  ({
    subdivisionWidth,
    subdivisionsArray,
    measuresArray,
    measureWidth,
    renderEveryFourthMeasure,
    scrollRef,
  }: GridProps) => {
    const { timeline, mixer } = useAudioEngine();
    const { tracks } = mixer;
    const width = timeline.pixels;
    const height = mixer.topPanelHeight;
    const className = "stroke-current text-surface-2";

    const [scrollLeft, setScrollLeft] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
      const updateViewportWidth = () => {
        if (scrollRef.current) {
          setViewportWidth(scrollRef.current.clientWidth);
        }
      };

      const handleScroll = () => {
        if (scrollRef.current) {
          setScrollLeft(scrollRef.current.scrollLeft);
        }
      };

      const scroll = scrollRef.current;

      if (scroll) {
        scroll.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", updateViewportWidth);
        updateViewportWidth();
      }

      return () => {
        if (scroll) {
          scroll.removeEventListener("scroll", handleScroll);
        }
        window.removeEventListener("resize", updateViewportWidth);
      };
    }, [scrollRef]);

    const calculateVisibleRange = useCallback(() => {
      if (renderEveryFourthMeasure) {
        const startMeasure =
          Math.max(Math.floor(scrollLeft / (measureWidth * 4)) - 1) >= 0
            ? Math.max(Math.floor(scrollLeft / (measureWidth * 4)) - 1)
            : 0;
        const endMeasure = Math.min(
          Math.ceil((scrollLeft + viewportWidth) / (measureWidth * 4)) + 1,
          Math.floor(measuresArray.length / 4)
        );

        return {
          startMeasure: startMeasure * 4,
          endMeasure: endMeasure * 4,
        };
      }
      const startMeasure = Math.max(
        Math.floor(scrollLeft / measureWidth) - 4,
        0
      );
      const endMeasure = Math.min(
        Math.ceil((scrollLeft + viewportWidth) / measureWidth) + 4,
        measuresArray.length
      );
      return { startMeasure, endMeasure };
    }, [
      renderEveryFourthMeasure,
      scrollLeft,
      measureWidth,
      viewportWidth,
      measuresArray.length,
    ]);

    const { startMeasure, endMeasure } = calculateVisibleRange();

    return (
      <svg width={width} height={height}>
        {drawLanes(className, width, tracks, mixer)}
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
