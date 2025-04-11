import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Band } from "@/pages/studio/audio-engine/components/effects/graphic-eq/components";
import styles from "./center-frequency.module.css";
import { useDeferredUpdate } from "@/pages/studio/hooks";

interface CenterPointProps {
  band: Band;
  range: number[];
  scaleX: d3.ScaleLogarithmic<number, number, never>;
  scaleY: d3.ScaleLinear<number, number, never>;
  selected: boolean;
  rgbColor: string;
  onClick: () => void;
}

export const CenterFrequency = ({
  band,
  range,
  scaleX,
  scaleY,
  selected,
  rgbColor,
  onClick,
}: CenterPointProps) => {
  const circleRef = useRef<SVGCircleElement>(null);

  const { onValueChange: onFreqChange, onValueCommit: onFreqCommit } =
    useDeferredUpdate<number>(band.frequency, (value) =>
      band.setFrequency(Math.round(value))
    );

  const { onValueChange: onGainChange, onValueCommit: onGainCommit } =
    useDeferredUpdate<number>(band.gain, (value) =>
      band.setGain(Number(value.toFixed(2)))
    );

  useEffect(() => {
    if (circleRef.current) {
      const [min, max] = range;

      // Process both mouse drag events and touch events
      const processMove = (eventX: number, eventY: number) => {
        const newX = scaleX.invert(eventX);
        const newY = scaleY.invert(eventY);

        if (newX >= min && newX <= max) {
          onFreqChange(newX);
        } else {
          return;
        }

        if (band.type !== "highpass") {
          if (newY <= 12 && newY >= -12) {
            d3.select(circleRef.current).attr("cx", eventX).attr("cy", eventY);
            onGainChange(newY);
          } else {
            return;
          }
        }
      };

      // D3 drag handler (for mouse events)
      const dragHandler = d3
        .drag<SVGCircleElement, unknown>()
        .on("start", function () {
          document.body.style.cursor = "crosshair";
          onClick();
          d3.select(this).raise();
        })
        .on("drag", function (event) {
          processMove(event.x, event.y);
        })
        .on("end", function () {
          onFreqCommit(band.frequency);
          onGainCommit(band.gain);
          document.body.style.cursor = "auto";
        });

      const element = d3.select(circleRef.current);

      // Apply the D3 drag handler for mouse events
      element.call(dragHandler);

      // Touch event handlers
      const handleTouchStart = (event: TouchEvent) => {
        event.preventDefault(); // Prevent scrolling
        document.body.style.cursor = "crosshair";
        onClick();
        element.raise();
      };

      const handleTouchMove = (event: TouchEvent) => {
        event.preventDefault(); // Prevent scrolling

        if (event.touches.length !== 1) return;

        const touch = event.touches[0];
        const svgElement = circleRef.current!.ownerSVGElement;

        if (!svgElement) return;

        // Convert touch coordinates to SVG coordinates
        const pt = svgElement.createSVGPoint();
        pt.x = touch.clientX;
        pt.y = touch.clientY;
        const svgPoint = pt.matrixTransform(
          svgElement.getScreenCTM()!.inverse()
        );

        processMove(svgPoint.x, svgPoint.y);
      };

      const handleTouchEnd = () => {
        onFreqCommit(band.frequency);
        onGainCommit(band.gain);
        document.body.style.cursor = "auto";
      };

      // Add touch event listeners
      const node = element.node();
      if (node) {
        node.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        node.addEventListener("touchmove", handleTouchMove, { passive: false });
        node.addEventListener("touchend", handleTouchEnd);
        node.addEventListener("touchcancel", handleTouchEnd);
      }

      // Clean up function
      return () => {
        if (node) {
          node.removeEventListener("touchstart", handleTouchStart);
          node.removeEventListener("touchmove", handleTouchMove);
          node.removeEventListener("touchend", handleTouchEnd);
          node.removeEventListener("touchcancel", handleTouchEnd);
        }
      };
    }
  }, [
    scaleX,
    scaleY,
    band,
    range,
    onClick,
    onFreqChange,
    onGainChange,
    onFreqCommit,
    onGainCommit,
  ]);

  return (
    <circle
      className={styles.point}
      ref={circleRef}
      stroke={selected ? rgbColor : "#888"}
      fill="transparent"
      cx={scaleX(band.frequency)}
      cy={scaleY(band.gain)}
      r={5}
    />
  );
};
