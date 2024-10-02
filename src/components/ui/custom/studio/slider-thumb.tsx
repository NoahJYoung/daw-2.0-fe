interface SliderThumbProps {
  orientation: "vertical" | "horizontal";
  className?: string;
}

export const SliderThumb = ({ orientation, className }: SliderThumbProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="54" // SVG width increased by 4 pixels
      height="8"
      viewBox="0 0 102 16" // viewBox width updated from 96 to 100
      fill="none"
      transform={orientation === "horizontal" ? "rotate(90)" : undefined}
    >
      <polygon className="fill-current" points="10,8 0,0 0,16" fill="black" />
      <polygon
        className="fill-current"
        points="90,8 102,0 102,16"
        fill="black"
      />{" "}
      {/* Adjusted to account for the extra width */}
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
