export const renderGrid = (
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
          className="z-20 stroke-current text-surface-2"
          key={`measure-${measureIndex}`}
          strokeWidth={1}
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
          className="z-20 stroke-current text-surface-0"
          key={`subdivision-${startMeasure + i}-${j}`}
          strokeWidth={1}
          x1={subdivisionWidth * j + 1}
          x2={subdivisionWidth * j + 1}
          y1={0}
          y2={height}
        />
      ))}
    </g>
  ));
};
