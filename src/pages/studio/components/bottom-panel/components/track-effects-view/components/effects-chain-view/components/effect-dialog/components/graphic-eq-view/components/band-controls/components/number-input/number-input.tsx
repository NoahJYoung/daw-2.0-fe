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
  allowDecimal?: boolean;
  width?: number;
}

export const NumberInput = observer(
  ({
    min,
    max,
    value,
    onCommit,
    step = 1,
    suffix,
    allowDecimal = false,
    width = 42,
  }: NumberInputProps) => {
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        inputRef.current?.blur();
      }
      if (
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "Tab" ||
        e.key === "Escape" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        (e.ctrlKey &&
          (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x"))
      ) {
        return;
      }

      if (allowDecimal) {
        if (!/^[0-9]$/.test(e.key) && e.key !== ".") {
          e.preventDefault();
          e.stopPropagation();
        }

        if (
          e.key === "." &&
          (e.currentTarget as HTMLInputElement).value.includes(".")
        ) {
          e.preventDefault();
          e.stopPropagation();
        }
      } else if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const minCharLength = min.toString().split("").length;
    const maxCharLength = max.toString().split("").length;

    const maxChars = Math.max(minCharLength, maxCharLength);
    const calculatedWidth = Math.max(maxChars * 10, width);

    return (
      <span className="flex items-center">
        <input
          name="bpm"
          id="bpm"
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          style={{ width: calculatedWidth }}
          className="no-arrows pr-1 text-center text-surface-6 text-sm bg-surface-mid focus:bg-surface-2 focus:select-text p-1 text-ellipsis focus:outline-none"
          value={`${localValue}`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            setLocalValue(
              allowDecimal
                ? parseFloat(e.target.value)
                : parseInt(e.target.value)
            );
          }}
          onBlur={commitValue}
          onWheel={handleWheel}
          onKeyDown={handleKeyDown}
        />
        {suffix && <label className="text-xs select-none">{suffix}</label>}
      </span>
    );
  }
);
