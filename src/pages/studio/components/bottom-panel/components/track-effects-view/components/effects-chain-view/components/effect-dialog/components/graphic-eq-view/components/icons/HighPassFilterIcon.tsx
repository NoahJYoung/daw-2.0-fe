export const HighPassFilterIcon = ({
  color = "#888",
  size = 24,
  stroke = "5",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "flex", alignItems: "center" }}
  >
    <rect width="100%" height="100%" fill="transparent" />
    <polyline
      points="5,70 30,35 95,35"
      stroke={color}
      strokeWidth={stroke}
      fill="none"
    />
  </svg>
);
