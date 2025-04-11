import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface KnobProps {
  value: number;
  min: number;
  max: number;
  size: number;
  step: number;
  onValueChange: (newValue: number) => void;
  onValueCommit: (value: number) => void;
  onDoubleClick?: (value?: number) => void;
  renderValue?: (value: number) => number | string;
  color?: string;
  double?: boolean;
  showValue?: boolean;
  valuePosition?: "top" | "bottom";
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
}

export const Knob = ({
  value,
  onValueChange,
  onValueCommit,
  onDoubleClick,
  renderValue,
  min,
  max,
  step,
  size,
  color,
  double,
  showValue = true,
  valuePosition = "bottom",
  minLabel,
  maxLabel,
  disabled,
}: KnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<SVGSVGElement>(null);

  const minRotation = -135;
  const maxRotation = 135;
  const midValue = (min + max) / 2;

  const getAngles = (minRotation: number) => {
    let endAngle = 0;
    let startAngle = 0;

    if (double) {
      if (value < midValue) {
        endAngle = 0 + ((value - midValue) / (min - midValue)) * -135;
      } else if (value > midValue) {
        endAngle = 0 + ((value - midValue) / (max - midValue)) * 135;
      }
    } else {
      startAngle = -135;
      const percentage = (value - min) / (max - min);
      endAngle = minRotation + percentage * (maxRotation - minRotation);
    }

    return { startAngle, endAngle };
  };

  const { startAngle, endAngle } = getAngles(minRotation);

  const describeArc = (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const angleDiff = Math.abs(endAngle - startAngle);
    const largeArcFlag = angleDiff <= 180 ? "0" : "1";

    const sweepFlag = value >= midValue || !double ? 0 : 1;

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      sweepFlag,
      end.x,
      end.y,
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const arcPath = describeArc(
    size / 2,
    size / 2,
    size / 2 - 1.5,
    startAngle,
    endAngle
  );

  const calculateNewValue = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled || !knobRef.current) return;

      const rect = knobRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = clientX - centerX;
      const y = clientY - centerY;
      const angle = Math.round(Math.atan2(y, x) * (180 / Math.PI));

      let adjustedAngle = angle + 135;
      if (adjustedAngle < 0) adjustedAngle = 0;
      if (adjustedAngle > 270) adjustedAngle = 270;

      const rawValue = min + (adjustedAngle / 270) * (max - min);

      const newValue = Math.round(rawValue / step) * step;
      const decimalPlaces = step.toString().split(".")[1]?.length || 0;
      return parseFloat(newValue.toFixed(decimalPlaces));
    },
    [disabled, max, min, step]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (disabled || !isDragging) return;

      const newValue = calculateNewValue(e.clientX, e.clientY);
      if (newValue !== undefined) {
        onValueChange(newValue);
      }
    },
    [disabled, isDragging, calculateNewValue, onValueChange]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      if (isDragging) {
        onValueCommit(value);
      }
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    },
    [disabled, isDragging, onValueCommit, value]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    e.stopPropagation();
    e.preventDefault();
    document.body.style.userSelect = "none";
    setIsDragging(true);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || !isDragging) return;
      e.preventDefault();

      const touch = e.touches[0];
      const newValue = calculateNewValue(touch.clientX, touch.clientY);
      if (newValue !== undefined) {
        onValueChange(newValue);
      }
    },
    [disabled, isDragging, calculateNewValue, onValueChange]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled) return;
      e.stopPropagation();
      if (isDragging) {
        onValueCommit(value);
      }
      setIsDragging(false);
      document.body.style.userSelect = "";
    },
    [disabled, isDragging, onValueCommit, value]
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <span
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={() => onDoubleClick && onDoubleClick(value)}
      className={cn("flex justify-center relative", {
        "cursor-grabbing": isDragging,
        "cursor-grab": !disabled && !isDragging,
        "cursor-not-allowed": disabled,
        "opacity-50": disabled,
      })}
    >
      <svg
        ref={knobRef}
        width={size}
        height={size}
        className={cn("flex justify-center items-center", {
          "scale-105": isDragging,
          "hover:scale-105": !disabled,
        })}
      >
        <circle
          className="fill-current text-surface-5"
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
        />

        <circle
          className="fill-current text-surface-2"
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 3}
        />

        {value !== midValue && (
          <path
            d={arcPath}
            stroke={color}
            className={color ? "" : "stroke-current text-surface-8"}
            strokeWidth={3}
            fill="none"
          />
        )}

        <line
          x1={size / 2}
          y1={size / 2}
          x2={size / 2}
          y2={1}
          stroke={color}
          className={color ? "" : "stroke-current text-surface-8"}
          strokeWidth={2}
          transform={`rotate(${endAngle}, ${size / 2}, ${size / 2})`}
        />
      </svg>
      {showValue && isDragging && (
        <span
          style={
            valuePosition === "bottom"
              ? { top: size * 1.3, left: -5 }
              : { bottom: size * 1.3, left: -5 }
          }
          className="absolute w-full flex items-center justify-center z-30"
        >
          <span className="text-xs p-1 bg-surface-2 border border-surface-3">
            {renderValue
              ? renderValue(value)
              : value.toFixed(step.toString().split(".")[1]?.length || 0)}
          </span>
        </span>
      )}
      <span
        style={{ width: size * 1.2, top: size - size * 0.1 }}
        className="flex justify-between absolute"
      >
        {minLabel && (
          <p
            className="text-surface-5 font-bold select-none"
            style={{ fontSize: Math.min(Math.max(size * 0.3, 8), 12) }}
          >
            {minLabel}
          </p>
        )}
        {maxLabel && (
          <p
            className="text-surface-5 font-bold select-none"
            style={{ fontSize: Math.min(Math.max(size * 0.3, 8), 12) }}
          >
            {maxLabel}
          </p>
        )}
      </span>
    </span>
  );
};
