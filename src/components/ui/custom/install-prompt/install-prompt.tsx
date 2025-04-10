/* eslint-disable @typescript-eslint/no-explicit-any */
import { isMobileDevice } from "@/pages/studio/utils";
import React, { useState, useEffect, ReactNode } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface InstallPromptProps {
  children: ReactNode;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ children }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  const isMobile = isMobileDevice();

  useEffect(() => {
    const checkStandalone = (): boolean => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in window.navigator &&
          (window.navigator as any).standalone) ||
        document.referrer.includes("android-app://");

      return standalone;
    };

    const appIsStandalone = checkStandalone();
    setIsStandalone(appIsStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      if (isMobile && !appIsStandalone) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );

    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");
      setShowInstallPrompt(false);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
      window.removeEventListener("appinstalled", () => {
        console.log("PWA was installed");
        setShowInstallPrompt(false);
        setIsStandalone(true);
      });
    };
  }, [isMobile]);

  const handleInstallClick = (): void => {
    if (!installEvent) return;

    installEvent.prompt();

    installEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setInstallEvent(null);
    });
  };

  const isIOS: boolean =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  if (isStandalone) {
    return children;
  }

  if (showInstallPrompt && isMobile && !isStandalone) {
    return (
      <div
        className="install-prompt-container bg-surface-0 text-surface-8"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>Download Our App</h2>
        <p>Get a better experience by installing our app on your device!</p>

        {isIOS ? (
          <div>
            <p>To install this app on your iOS device:</p>
            <ol style={{ textAlign: "left" }}>
              <li>
                Tap the share icon <span style={{ fontSize: "1.2em" }}>􀈂</span>{" "}
                at the bottom of the screen
              </li>
              <li>Scroll down and tap "Add to Home Screen"</li>
              <li>Tap "Add" in the top right corner</li>
            </ol>
          </div>
        ) : installEvent ? (
          <button
            onClick={handleInstallClick}
            className="bg-brand-1 text-white"
            style={{
              backgroundColor: "te",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              fontSize: "16px",
              marginTop: "20px",
              cursor: "pointer",
            }}
          >
            Install App
          </button>
        ) : (
          <p>
            To install, open this site in Chrome on Android or Safari on iOS.
          </p>
        )}

        <button
          onClick={() => {
            setShowInstallPrompt(false);
            console.log("TOUCHED");
          }}
          onTouchEnd={() => setShowInstallPrompt(false)}
          className="text-surface-8"
          style={{
            backgroundColor: "transparent",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px 16px",
            fontSize: "14px",
            marginTop: "20px",
            cursor: "pointer",
          }}
        >
          Continue to Studio
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
