import { useState, useEffect, ReactNode } from "react";

interface OrientationManagerProps {
  requireLandscape: boolean;
  children: ReactNode;
}

export const OrientationManager = ({
  requireLandscape,
  children,
}: OrientationManagerProps) => {
  const [isWrongOrientation, setIsWrongOrientation] = useState(false);

  useEffect(() => {
    if (!requireLandscape) return;

    const canLock =
      screen.orientation &&
      screen.orientation.lock &&
      typeof screen.orientation.lock === "function";

    const checkOrientation = () => {
      if (requireLandscape) {
        const isLandscape = window.innerWidth > window.innerHeight;
        setIsWrongOrientation(!isLandscape);
      } else {
        setIsWrongOrientation(false);
      }
    };

    const setupOrientationDetection = () => {
      checkOrientation();

      window.addEventListener("resize", checkOrientation);

      return () => {
        window.removeEventListener("resize", checkOrientation);
      };
    };

    if (canLock) {
      screen.orientation.lock("landscape").catch((error) => {
        console.log(
          "Orientation lock failed, falling back to detection",
          error
        );
        setupOrientationDetection();
      });

      return () => {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      };
    } else {
      setupOrientationDetection();
    }
  }, [requireLandscape]);

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
