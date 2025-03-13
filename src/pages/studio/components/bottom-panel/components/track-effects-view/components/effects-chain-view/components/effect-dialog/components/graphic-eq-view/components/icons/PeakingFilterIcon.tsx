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
    <path
      d="M5,70 C15,70 25,70 30,55 S45,25 50,25 S65,25 70,45 S80,70 100,70"
      stroke={color}
      strokeWidth={stroke}
      fill="none"
    />
  </svg>
);
