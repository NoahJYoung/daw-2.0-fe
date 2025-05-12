import "./loader.css";

interface LoaderProps {
  color?: string;
  text?: string;
  loading?: boolean;
  size?: "sm" | "md" | "lg";
}

export const AppLoader = ({ size = "md", text = "", loading }: LoaderProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-16",
    lg: "h-24",
  };

  const barCount = 7;
  const bars = Array(barCount).fill(0);

  return loading ? (
    <div
      style={{ zIndex: 100, background: "rgba(175, 175, 175, 0.2)" }}
      className="absolute left-0 top-0 flex flex-col items-center justify-center gap-4 h-full w-full"
    >
      <div
        className={`absolute flex items-center justify-center gap-1 ${sizeClasses[size]}`}
      >
        {bars.map((_, i) => (
          <div
            key={i}
            className={`relative w-1 md:w-1.5 ${size === "lg" ? "w-2" : ""} h-2`}
          >
            <div
              className=" bottom-0 left-0 right-0 rounded-full"
              style={{
                backgroundColor: "#888888",
                height: "20%",
                willChange: "transform, background-color",
                animation: `waveform 1s ease-in-out infinite ${i * 0.1}s`,
                transform: "translateZ(0)",
              }}
            />
          </div>
        ))}
      </div>
      {text && (
        <div
          style={{ zIndex: 100 }}
          className="absolute text-center pt-12 font-bold text-surface-8"
        >
          {text}
        </div>
      )}
    </div>
  ) : null;
};
