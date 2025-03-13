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
      const dragHandler = d3
        .drag<SVGCircleElement, unknown>()
        .on("start", function () {
          document.body.style.cursor = "crosshair";
          onClick();
          d3.select(this).raise();
        })
        .on("drag", function (event) {
          const newX = scaleX.invert(event.x);
          const newY = scaleY.invert(event.y);

          if (newX >= min && newX <= max) {
            onFreqChange(newX);
          } else {
            return;
          }

          if (band.type !== "highpass") {
            if (newY <= 12 && newY >= -12) {
              d3.select(this).attr("cx", event.x).attr("cy", event.y);
              onGainChange(newY);
            } else {
              return;
            }
          }
        })
        .on("end", function () {
          onFreqCommit(band.frequency);
          onGainCommit(band.gain);
          document.body.style.cursor = "auto";
        });

      d3.select(circleRef.current).call(dragHandler);
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
