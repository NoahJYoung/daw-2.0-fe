interface LevelViewProps {
  height: number;
}

export const LevelView = ({ height }: LevelViewProps) => {
  const heightOffset = Math.round(height * 0.02);
  const renderSixDbValues = height >= 170;
  return (
    <svg
      height={height}
      width={100}
      style={{ position: "absolute", left: 0, top: 0, zIndex: 1 }}
    >
      {renderSixDbValues && (
        <text className="fill-current text-surface-5" x="7" y="9" fontSize="12">
          +6
        </text>
      )}
      <text
        className="fill-current text-surface-5"
        x="7"
        y={height * 0.125 + 3}
        fontSize="12"
      >
        +0
      </text>
      {renderSixDbValues && (
        <text
          className="fill-current text-surface-5"
          x="7"
          y={height * 0.25}
          fontSize="12"
        >
          -6
        </text>
      )}

      <text
        className="fill-current text-surface-5"
        x="7"
        y={height * 0.4375}
        fontSize="12"
      >
        -18
      </text>

      <text
        className="fill-current text-surface-5"
        x="7"
        y={height * 0.625}
        fontSize="12"
      >
        -36
      </text>
      <text
        className="fill-current text-surface-5"
        x="7"
        y={height - 2}
        fontSize="12"
      >
        -60
      </text>

      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={heightOffset}
        x2="80"
        y2={heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={height * 0.125 - heightOffset}
        x2="80"
        y2={height * 0.125 - heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={height * 0.25 - heightOffset}
        x2="80"
        y2={height * 0.25 - heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={height * 0.4375 - heightOffset}
        x2="80"
        y2={height * 0.4375 - heightOffset}
        strokeWidth="1"
      />

      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={height * 0.625 - heightOffset}
        x2="80"
        y2={height * 0.625 - heightOffset}
        strokeWidth="1"
      />
      <line
        className="stroke-current text-surface-4"
        x1="32"
        y1={height - heightOffset}
        x2="80"
        y2={height - heightOffset}
        strokeWidth="1"
      />
    </svg>
  );
};
