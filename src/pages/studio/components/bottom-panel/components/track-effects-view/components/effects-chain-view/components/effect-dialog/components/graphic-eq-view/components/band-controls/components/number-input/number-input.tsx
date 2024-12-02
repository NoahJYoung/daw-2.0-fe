import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

interface NumberInputProps {
  min: number;
  max: number;
  value: number;
  onCommit: (value: number) => void;
  className?: string;
  step?: number;
  suffix?: string;
}

export const NumberInput = observer(
  ({ min, max, value, onCommit, step = 1, suffix }: NumberInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);

    const handleWheel = (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        const newValue = value - step;
        if (newValue >= min) {
          setLocalValue(value - step);
        }
      } else {
        const newValue = value + step;
        if (newValue <= max) {
          setLocalValue(value + step);
        }
      }
    };

    const commitValue = () => {
      onCommit(localValue);
    };

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const minCharLength = min.toString().split("").length;
    const maxCharLength = max.toString().split("").length;

    const maxChars = Math.max(minCharLength, maxCharLength);
    const width = Math.max(maxChars * 10, 42);

    return (
      <span className="flex items-center">
        <input
          name="bpm"
          id="bpm"
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          style={{ width }}
          className="no-arrows pr-1 text-center text-surface-6 text-sm bg-surface-mid focus:bg-surface-2 focus:select-text p-1 text-ellipsis focus:outline-none"
          value={`${localValue}`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setLocalValue(parseInt(e.target.value))}
          onBlur={commitValue}
          onWheel={handleWheel}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputRef?.current?.blur();
            }
          }}
        />
        {suffix && <label className="text-xs select-none">{suffix}</label>}
      </span>
    );
  }
);
