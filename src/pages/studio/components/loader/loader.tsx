import { observer } from "mobx-react-lite";
import { useAudioEngine } from "../../hooks";
import { useState, useEffect } from "react";

interface BarData {
  height: number;
  speed: number;
  rising: boolean;
}

interface LoaderProps {
  color?: string;
  width?: string | number;
  height?: number;
  barCount?: number;
  global?: boolean;
  borderRadius?: string;
}

export const Loader = observer(
  ({
    color = "#888",
    width = "100%",
    height = 30,
    barCount = 30,
    global = true,
    borderRadius = "inherit",
  }: LoaderProps) => {
    const audioEngine = useAudioEngine();
    const [bars, setBars] = useState<BarData[]>([]);
    const [ellipsis, setEllipsis] = useState("");

    useEffect(() => {
      const initialBars: BarData[] = Array.from({ length: barCount }, () => ({
        height: Math.random() * 0.8 + 0.2,
        rising: Math.random() > 0.5,
        speed: Math.random() * 0.04 + 0.01,
      }));

      setBars(initialBars);

      const barsInterval = setInterval(() => {
        setBars((prevBars) =>
          prevBars.map((bar) => {
            let newHeight = bar.height;

            if (bar.rising) {
              newHeight += bar.speed;
              if (newHeight > 1) {
                newHeight = 1;
                return { ...bar, height: newHeight, rising: false };
              }
            } else {
              newHeight -= bar.speed;
              if (newHeight < 0.2) {
                newHeight = 0.2;
                return { ...bar, height: newHeight, rising: true };
              }
            }

            return { ...bar, height: newHeight };
          })
        );
      }, 50);

      const ellipsisInterval = setInterval(() => {
        setEllipsis((prev) => {
          if (prev === "...") {
            return "";
          } else {
            return prev.concat(".");
          }
        });
      }, 500);

      return () => {
        clearInterval(barsInterval);
        clearInterval(ellipsisInterval);
      };
    }, [barCount]);

    return audioEngine.loadingState || !global ? (
      <div
        style={{
          top: 0,
          left: 0,
          position: global ? "fixed" : "absolute",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10000,
          background: "rgba(165, 165, 165, 0.3)",
          width: global ? "100vw" : "100%",
          height: global ? "100vh" : "100%",
          borderRadius,
        }}
      >
        <span className="flex flex-col gap-1 justify-center items-center">
          {global && (
            <div className="flex justify-center items-center font-semibold text-surface-7">
              <span style={{ minWidth: "4ch" }}>
                {audioEngine.loadingState}
              </span>
              <span style={{ width: "3ch", textAlign: "left" }}>
                {ellipsis}
              </span>
            </div>
          )}
          <div
            className="relative"
            style={{
              width,
              height,
              backgroundColor: "transparent",
              overflow: "hidden",
            }}
          >
            <div className="flex items-center justify-between h-full w-full">
              {bars.map((bar, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-center items-center"
                  style={{ height: "100%" }}
                >
                  <div
                    className="rounded-sm mx-1 transition-all duration-100 ease-in-out"
                    style={{
                      backgroundColor: color,
                      width: `${100 / (barCount * 2)}%`,
                      height: `${bar.height * 100}%`,
                      minWidth: "3px",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </span>
      </div>
    ) : null;
  }
);
