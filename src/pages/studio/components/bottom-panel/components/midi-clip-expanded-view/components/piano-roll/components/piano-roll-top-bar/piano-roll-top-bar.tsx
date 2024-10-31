interface PianoRollTopBarProps {
  width: number;
  measureWidth: number;
  measuresArray: number[];
  renderEveryFourthMeasure: boolean;
  startMeasure: number;
}

export const PianoRollTopBar = ({
  width,
  measureWidth,
  measuresArray,
  renderEveryFourthMeasure,
  startMeasure,
}: PianoRollTopBarProps) => {
  return (
    <svg
      style={{ width }}
      className="border-r-0 border-t-0 border-surface-1 border h-[20px] max-h-full flex sticky top-0 bg-surface-4 select-none flex-shrink-0 z-30"
    >
      {renderEveryFourthMeasure
        ? measuresArray.slice(0, measuresArray.length / 4).map((_, i) => (
            <g key={`measure-${i}`}>
              <line
                className="stroke-current stroke-surface-1"
                strokeWidth={1}
                x1={measureWidth * 4 * i}
                x2={measureWidth * 4 * i}
                y1={0}
                y2={20}
              />
            </g>
          ))
        : measuresArray.map((_, i) => (
            <g key={`measure-${i}`}>
              <line
                className="stroke-current stroke-surface-1"
                strokeWidth={1}
                x1={measureWidth * i}
                x2={measureWidth * i}
                y1={0}
                y2={20}
              />
              <text
                className="text-xs text-surface-5 stroke-current"
                y={12.5}
                x={measureWidth * i + 4}
              >
                {i + startMeasure}
              </text>
            </g>
          ))}
    </svg>
  );
};
