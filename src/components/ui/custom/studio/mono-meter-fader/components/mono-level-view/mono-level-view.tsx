interface LevelViewProps {
  height: number;
  orientation?: "left" | "right";
}

export const MonoLevelView = ({
  height,
  orientation = "left",
}: LevelViewProps) => {
  const heightOffset = Math.round(height * 0.02);
  const textX = orientation === "left" ? 12 : 26;
  const lineStartX = orientation === "left" ? 32 : 2;
  const lineEndX = orientation === "left" ? 80 : 26;

  const positionForDb = (dbValue: number) => {
    return 1 - (dbValue + 60) / 72;
  };

  const pos12db = heightOffset + positionForDb(12) * height;
  const pos0db = heightOffset + positionForDb(0) * height;
  const posMinus6db = heightOffset + positionForDb(-6) * height;
  const posMinus18db = heightOffset + positionForDb(-18) * height;
  const posMinus36db = heightOffset + positionForDb(-36) * height;
  const posMinus60db = heightOffset + positionForDb(-60) * height;

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
      <text
        className="fill-current text-surface-5"
        x={textX - 2}
        y={pos12db + 10}
        fontSize="12"
      >
        +12
      </text>

      <text
        className="fill-current text-surface-5"
        x={textX}
        y={pos0db + 3}
        fontSize="12"
      >
        +0
      </text>

      <text
        className="fill-current text-surface-5"
        x={textX + 3}
        y={posMinus6db + 3}
        fontSize="12"
      >
        -6
      </text>

      <text
        className="fill-current text-surface-5"
        x={textX}
        y={posMinus18db + 3}
        fontSize="12"
      >
        -18
      </text>

      <text
        className="fill-current text-surface-5"
        x={textX}
        y={posMinus36db + 3}
        fontSize="12"
      >
        -36
      </text>

      <text
        className="fill-current text-surface-5"
        x={textX}
        y={posMinus60db - 2}
        fontSize="12"
      >
        -60
      </text>

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={pos12db}
        x2={lineEndX}
        y2={pos12db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={pos0db}
        x2={lineEndX}
        y2={pos0db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={posMinus6db}
        x2={lineEndX}
        y2={posMinus6db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={posMinus18db}
        x2={lineEndX}
        y2={posMinus18db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={posMinus36db}
        x2={lineEndX}
        y2={posMinus36db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1={lineStartX}
        y1={posMinus60db}
        x2={lineEndX}
        y2={posMinus60db}
        strokeWidth="1"
      />
    </svg>
  );
};
