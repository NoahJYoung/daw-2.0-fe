export const TimeSignatureIcon = ({
  className,
  upper,
  lower,
}: {
  className?: string;
  upper: number;
  lower: number;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="100"
    height="100"
    fill="black"
    className={className}
  >
    <text
      x="50%"
      y="30%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="40"
      fontWeight="bold"
    >
      {upper}
    </text>

    <line
      x1="25"
      y1="50"
      x2="75"
      y2="50"
      className="stroke-current"
      strokeWidth="5"
    />

    <text
      x="50%"
      y="80%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="40"
      fontWeight="bold"
    >
      {lower}
    </text>
  </svg>
);
