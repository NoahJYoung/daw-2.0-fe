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
}: KnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<SVGSVGElement>(null);

  const initialRotation = 135;
  const minRotation = -135;
  const maxRotation = 135;

  const rotation =
    minRotation +
    ((value - min) / (max - min)) * (maxRotation - minRotation) +
    initialRotation;

  const handleMouseDown = () => {
    document.body.style.userSelect = "none";
    setIsDragging(true);
  };
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    onValueCommit(value);
    document.body.style.userSelect = "";
  }, [onValueCommit, value]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && knobRef.current) {
        const rect = knobRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        const angle = Math.round(Math.atan2(y, x) * (180 / Math.PI));

        let adjustedAngle = angle + 135;
        if (adjustedAngle < 0) adjustedAngle = 0;
        if (adjustedAngle > 270) adjustedAngle = 270;

        const rawValue = min + (adjustedAngle / 270) * (max - min);

        const newValue = Math.round(rawValue / step) * step;
        const decimalPlaces = step.toString().split(".")[1]?.length || 0;
        const roundedValue = parseFloat(newValue.toFixed(decimalPlaces));
        onValueChange(roundedValue);
      }
    },
    [isDragging, max, min, onValueChange, step]
  );

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    handleMouseMove,
    handleMouseUp,
    isDragging,
    max,
    min,
    onValueChange,
    step,
    value,
  ]);

  return (
    <span className="relative">
      <svg
        ref={knobRef}
        width={size}
        height={size}
        className="flex justify-center items-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle
          className="fill-current text-surface-2"
          onMouseDown={handleMouseDown}
          onDoubleClick={() => onDoubleClick && onDoubleClick(value)}
          cx={size - size / 2}
          cy={size - size / 2}
          r={size / 2}
        />
        <circle
          cx={size * 0.1 + 3}
          cy={size * 0.75}
          r={size * 0.1}
          className="fill-current text-surface-4"
        />
      </svg>
      {isDragging && (
        <span
          style={{ top: 25, left: -10, zIndex: 2 }}
          className="absolute text-sm p-1 bg-surface-2 border border-surface-3"
        >
          {renderValue
            ? renderValue(value)
            : value.toFixed(step.toString().split(".")[1]?.length || 0)}
        </span>
      )}
    </span>
  );
};
