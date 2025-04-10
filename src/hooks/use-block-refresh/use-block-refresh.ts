/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface UseBlockRefreshOptions {
  blockInNonStandaloneMode?: boolean;
  hasUnsavedChanges?: () => boolean;
  unsavedChangesMessage?: string;
  onRefreshAttempt?: (() => void) | null;
}

export function useBlockRefresh({
  blockInNonStandaloneMode = false,
  hasUnsavedChanges = () => false,
  unsavedChangesMessage = "Your changes may be lost. Are you sure?",
  onRefreshAttempt = null,
}: UseBlockRefreshOptions = {}): boolean {
  const [isStandaloneMode, setIsStandaloneMode] = useState<boolean>(false);

  useEffect(() => {
    const checkStandaloneMode = (): boolean => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        "standalone" in window.navigator ||
        document.referrer.includes("android-app://");

      setIsStandaloneMode(isStandalone);
      return isStandalone;
    };

    const isStandalone = checkStandaloneMode();

    if (isStandalone || blockInNonStandaloneMode) {
      let touchStartY = 0;

      const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "F5" || (event.ctrlKey && event.key === "r")) {
          event.preventDefault();
          if (onRefreshAttempt) onRefreshAttempt();
        }
      };

      const handleTouchStart = (event: TouchEvent): void => {
        touchStartY = event.touches[0].clientY;
      };

      const handleTouchMove = (event: TouchEvent): void => {
        if (
          document.scrollingElement?.scrollTop === 0 &&
          event.touches[0].clientY > touchStartY + 10
        ) {
          event.preventDefault();
          if (onRefreshAttempt) onRefreshAttempt();
        }
      };

      const handleBeforeUnload = (
        event: BeforeUnloadEvent
      ): string | undefined => {
        if (hasUnsavedChanges()) {
          event.preventDefault();
          event.returnValue = unsavedChangesMessage;
          return unsavedChangesMessage;
        }
        return undefined;
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      window.addEventListener("beforeunload", handleBeforeUnload);

      const displayModeQuery = window.matchMedia("(display-mode: standalone)");
      const handleDisplayModeChange = (e: MediaQueryListEvent): void => {
        setIsStandaloneMode(e.matches);
      };

      if (displayModeQuery.addEventListener) {
        displayModeQuery.addEventListener("change", handleDisplayModeChange);
      } else {
        (displayModeQuery as any).addListener?.(handleDisplayModeChange);
      }

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("beforeunload", handleBeforeUnload);

        if (displayModeQuery.removeEventListener) {
          displayModeQuery.removeEventListener(
            "change",
            handleDisplayModeChange
          );
        } else {
          // Older browsers
          (displayModeQuery as any).removeListener?.(handleDisplayModeChange);
        }
      };
    }
  }, [
    blockInNonStandaloneMode,
    hasUnsavedChanges,
    unsavedChangesMessage,
    onRefreshAttempt,
  ]);

  return isStandaloneMode;
}
