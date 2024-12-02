interface SliderThumbProps {
  orientation: "vertical" | "horizontal";
  className?: string;
  size?: "sm" | "lg";
}

export const SliderThumb = ({
  orientation,
  className,
  size = "lg",
}: SliderThumbProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size === "lg" ? "54" : "32"}
      height="8"
      viewBox="0 0 102 16"
      fill="none"
      transform={orientation === "horizontal" ? "rotate(90)" : undefined}
    >
      <polygon className="fill-current" points="10,8 0,0 0,16" fill="black" />
      <polygon
        className="fill-current"
        points="90,8 102,0 102,16"
        fill="black"
      />
      <line
        className="stroke-current"
        x1="8"
        x2="94"
        y1="8"
        y2="8"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};
