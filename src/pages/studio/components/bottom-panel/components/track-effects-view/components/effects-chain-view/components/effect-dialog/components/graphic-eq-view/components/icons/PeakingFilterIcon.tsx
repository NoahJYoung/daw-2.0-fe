interface PeakingFilterIconProps {
  color?: string;
  size?: number;
  stroke?: string;
  number?: number | null;
}

export const PeakingFilterIcon = ({
  color = "#888",
  size = 24,
  stroke = "5",
}: PeakingFilterIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "flex", alignItems: "center" }}
  >
    <polyline
      points="5,70 15,70 30,35 70,35 85,70 95,70"
      stroke={color}
      strokeWidth={stroke}
      fill="none"
    />
  </svg>
);
