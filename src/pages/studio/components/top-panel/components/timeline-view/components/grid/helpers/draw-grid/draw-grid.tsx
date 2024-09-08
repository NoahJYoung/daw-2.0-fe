export const drawGrid = (
  className: string,
  measuresArray: number[],
  measureWidth: number,
  subdivisionsArray: number[],
  subdivisionWidth: number,
  height: number,
  renderEveryFourthMeasure: boolean,
  startMeasure: number
) => {
  if (renderEveryFourthMeasure) {
    return measuresArray.map((_, i) => {
      const measureIndex = startMeasure + i * 4;
      return (
        <line
          key={`measure-${measureIndex}`}
          strokeWidth={1}
          className={className}
          x1={measureWidth * measureIndex}
          x2={measureWidth * measureIndex}
          y1={0}
          y2={height}
        />
      );
    });
  }

  return measuresArray.map((_, i) => (
    <g
      key={`measure-${startMeasure + i}`}
      transform={`translate(${measureWidth * (startMeasure + i)}, 0)`}
    >
      {subdivisionsArray.map((_, j) => (
        <line
          key={`subdivision-${startMeasure + i}-${j}`}
          strokeWidth={1}
          className={className}
          x1={
            startMeasure === 0 ? 1 + subdivisionWidth * j : subdivisionWidth * j
          }
          x2={subdivisionWidth * j}
          y1={0}
          y2={height}
        />
      ))}
    </g>
  ));
};
