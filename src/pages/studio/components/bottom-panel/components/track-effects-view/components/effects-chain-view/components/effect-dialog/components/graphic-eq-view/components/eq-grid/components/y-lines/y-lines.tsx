import { LineData } from "../../../../types";

interface YLinesProps {
  lines: LineData[];
  width: number;
  height: number;
  scaleY: (value: number) => number;
}

export const YLines = ({ lines, width, scaleY }: YLinesProps) => {
  return (
    <>
      {lines.map((line, i) => (
        <g key={i}>
          <line
            stroke="#888"
            strokeWidth={0.5}
            y1={Math.round(scaleY(line.value))}
            y2={Math.round(scaleY(line.value))}
            x1={0}
            x2={width}
          />
          <text
            fill="#888"
            textAnchor="middle"
            x={10}
            y={Math.round(scaleY(line.value)) - 5}
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
