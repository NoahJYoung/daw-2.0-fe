interface LevelViewProps {
  height: number;
}

export const LevelView = ({ height }: LevelViewProps) => {
  const heightOffset = Math.round(height * 0.02);

  const positionForDb = (dbValue: number) => {
    return 1 - (dbValue + 60) / 72;
  };

  const pos12db = heightOffset + positionForDb(12) * height;
  const pos6db = heightOffset + positionForDb(6) * height;
  const pos0db = heightOffset + positionForDb(0) * height;
  const posMinus6db = heightOffset + positionForDb(-6) * height;
  const posMinus18db = heightOffset + positionForDb(-18) * height;
  const posMinus36db = heightOffset + positionForDb(-36) * height;
  const posMinus60db = heightOffset + positionForDb(-60) * height;

  return (
    <svg
      height={height}
      width={"100%"}
      style={{ position: "absolute", left: 0, top: 0, zIndex: 10 }}
    >
      <text
        className="fill-current text-surface-5"
        x="9"
        y={pos12db + 6}
        fontSize="12"
      >
        +12
      </text>

      <text
        className="fill-current text-surface-5"
        x="88"
        y={pos6db + 3}
        fontSize="12"
      >
        +6
      </text>

      <text
        className="fill-current text-surface-5"
        x="92"
        y={posMinus6db + 3}
        fontSize="12"
      >
        -6
      </text>

      <text
        className="fill-current text-surface-5"
        x="9"
        y={posMinus18db + 3}
        fontSize="12"
      >
        -18
      </text>

      <text
        className="fill-current text-surface-5"
        x="88"
        y={posMinus36db + 3}
        fontSize="12"
      >
        -36
      </text>

      <text
        className="fill-current text-surface-5"
        x="9"
        y={posMinus60db - 4}
        fontSize="12"
      >
        -60
      </text>

      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={pos12db}
        x2="80"
        y2={pos12db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="37"
        y1={pos6db}
        x2="85"
        y2={pos6db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={pos0db}
        x2="80"
        y2={pos0db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="37"
        y1={posMinus6db}
        x2="85"
        y2={posMinus6db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={posMinus18db}
        x2="80"
        y2={posMinus18db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="37"
        y1={posMinus36db}
        x2="85"
        y2={posMinus36db}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={posMinus60db - heightOffset * 2}
        x2="80"
        y2={posMinus60db - heightOffset * 2}
        strokeWidth="1"
      />
    </svg>
  );
};
