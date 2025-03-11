import { LineData } from "../../../../types";

interface XLinesProps {
  lines: LineData[];
  height: number;
  width: number;
  scaleX: (value: number) => number;
}

export const XLines = ({ lines, height, scaleX }: XLinesProps) => {
  return (
    <>
      {lines.map((line, i) => (
        <g key={i}>
          <line
            stroke="#888"
            strokeWidth={0.5}
            y1={0}
            y2={height - 20}
            x1={Math.round(scaleX(line.value))}
            x2={Math.round(scaleX(line.value))}
          />
          <text
            fill="#888"
            textAnchor="middle"
            x={Math.round(scaleX(line.value))}
            y={height - 5}
            fontSize={"0.7rem"}
            style={{ userSelect: "none" }}
          >
            {line.displayValue}
          </text>
        </g>
      ))}
    </>
  );
};
