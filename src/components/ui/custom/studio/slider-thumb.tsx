interface SliderThumbProps {
  orientation: "vertical" | "horizontal";
  className?: string;
}

export const SliderThumb = ({ orientation, className }: SliderThumbProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="8"
      viewBox="0 0 96 16"
      fill="none"
      transform={orientation === "horizontal" ? "rotate(90)" : undefined}
    >
      <polygon className="fill-current" points="8,8 0,0 0,16" fill="black" />
      <polygon className="fill-current" points="88,8 96,0 96,16" fill="black" />
      <line
        className="stroke-current"
        x1="8"
        x2="88"
        y1="8"
        y2="8"
        stroke="black"
        strokeWidth="2"
      />
    </svg>
  );
};
