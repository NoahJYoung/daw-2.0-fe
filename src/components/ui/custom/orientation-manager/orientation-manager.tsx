/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, ReactNode, useCallback } from "react";

interface OrientationManagerProps {
  requireLandscape: boolean;
  children: ReactNode;
}

export const OrientationManager = ({
  requireLandscape,
  children,
}: OrientationManagerProps) => {
  const [isWrongOrientation, setIsWrongOrientation] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const setupOrientationDetection = useCallback(() => {
    const checkOrientation = () => {
      if (requireLandscape) {
        const isLandscape = window.innerWidth > window.innerHeight;
        setIsWrongOrientation(!isLandscape);
      } else {
        setIsWrongOrientation(false);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
    };
  }, [requireLandscape]);

  useEffect(() => {
    if (!requireLandscape) return;

    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } else {
          setupOrientationDetection();
        }
      } catch (error) {
        console.log("Fullscreen request failed:", error);
        setupOrientationDetection();
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => console.log(err));
      }
    };
  }, [requireLandscape, setupOrientationDetection]);

  useEffect(() => {
    if (!requireLandscape || !isFullscreen) return;

    const canLock =
      "orientation" in screen &&
      "lock" in screen.orientation &&
      typeof screen.orientation.lock === "function";

    if (canLock) {
      (screen.orientation as any).lock("landscape").catch((error: any) => {
        console.log(
          "Orientation lock failed, falling back to detection",
          error
        );
        setupOrientationDetection();
      });

      return () => {
        if ("orientation" in screen && "unlock" in screen.orientation) {
          (screen.orientation as any).unlock();
        }
      };
    } else {
      setupOrientationDetection();
    }
  }, [requireLandscape, isFullscreen, setupOrientationDetection]);

  if (isWrongOrientation) {
    return (
      <div className="please-rotate-container">
        <div className="rotate-message">
          <div className="rotate-icon">⟳</div>
          <p>Please rotate your device to landscape mode</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
