interface LevelViewProps {
  height: number;
  orientation?: "left" | "right";
}

export const MonoLevelView = ({
  height,
  orientation = "left",
}: LevelViewProps) => {
  const heightOffset = Math.round(height * 0.02);
  const renderSixDbValues = height >= 170;

  const textX = orientation === "left" ? 7 : 32;
  const lineStartX = orientation === "left" ? 32 : 2;
  const lineEndX = orientation === "left" ? 80 : 26;

  return (
    <svg
      height={height}
      width={56}
      style={{
        position: "absolute",
        left: orientation === "left" ? -20 : "auto",
        right: orientation === "right" ? -18 : "auto",
        top: 0,
        zIndex: 10,
      }}
    >
      {renderSixDbValues && (
        <text
          className="fill-current text-surface-5"
          x={textX}
          y="9"
          fontSize="12"
        >
          +6
        </text>
      )}
      <text
        className="fill-current text-surface-5"
        x={textX}
        y={height * 0.125 + 3}
        fontSize="12"
      >
        +0
      </text>
      {renderSixDbValues && (
        <text
          className="fill-current text-surface-5"
          x={textX}
          y={height * 0.25}
          fontSize="12"
        >
          -6
        </text>
      )}

      <text
        className="fill-current text-surface-5"
        x={textX}
        y={height * 0.4375}
        fontSize="12"
      >
        -18
      </text>

      <text
        className="fill-current text-surface-5"
        x={textX}
        y={height * 0.625}
        fontSize="12"
      >
        -36
      </text>
      <text
        className="fill-current text-surface-5"
        x={textX}
        y={height - 2}
        fontSize="12"
      >
        -60
      </text>

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={heightOffset}
        x2={lineEndX}
        y2={heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={height * 0.125 - heightOffset}
        x2={lineEndX}
        y2={height * 0.125 - heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={height * 0.25 - heightOffset}
        x2={lineEndX}
        y2={height * 0.25 - heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={height * 0.4375 - heightOffset}
        x2={lineEndX}
        y2={height * 0.4375 - heightOffset}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={height * 0.625 - heightOffset}
        x2={lineEndX}
        y2={height * 0.625 - heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={height - heightOffset}
        x2={lineEndX}
        y2={height - heightOffset}
        strokeWidth="1"
      />
    </svg>
  );
};
