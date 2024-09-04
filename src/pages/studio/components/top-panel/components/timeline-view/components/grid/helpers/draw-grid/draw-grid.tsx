export const drawGrid = (
  className: string,
  measuresArray: number[],
  measureWidth: number,
  subdivisionsArray: number[],
  subdivisionWidth: number,
  height: number,
  renderEveryFourthMeasure: boolean
) =>
  renderEveryFourthMeasure
    ? measuresArray
        .slice(0, measuresArray.length / 4)
        .map((_, i) => (
          <line
            key={`measure-${i}`}
            strokeWidth={1}
            className={className}
            x1={measureWidth * 4 * i}
            x2={measureWidth * 4 * i}
            y1={0}
            y2={height}
          />
        ))
    : measuresArray.map((_, i) => (
        <g
          key={`measure-${i}`}
          transform={`translate(${
            i === 0 ? 1 + measureWidth * i : measureWidth * i
          }, 0)`}
        >
          {subdivisionsArray.map((_, j) => (
            <line
              key={`subdivision-${i}-${j}`}
              strokeWidth={1}
              className={className}
              x1={subdivisionWidth * j}
              x2={subdivisionWidth * j}
              y1={0}
              y2={height}
            />
          ))}
        </g>
      ));
