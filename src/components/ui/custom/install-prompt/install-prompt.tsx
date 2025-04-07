/* eslint-disable @typescript-eslint/no-explicit-any */
// InstallPrompt.tsx

import React, { useState, useEffect, ReactNode } from "react";

// Define interface for beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Define props interface
interface InstallPromptProps {
  children: ReactNode;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ children }) => {
  const [showInstallPrompt, setShowInstallPrompt] = useState<boolean>(false);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled: boolean =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone || // For iOS
      document.referrer.includes("android-app://");

    setIsStandalone(isAppInstalled);

    // Detect if user is on mobile
    const checkMobile = (): boolean => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|iPad|iPhone|iPod|webOS|BlackBerry|Windows Phone/i.test(
        userAgent
      );
    };

    setIsMobile(checkMobile());

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallEvent(e as BeforeInstallPromptEvent);
      // Only show prompt if user is on mobile and app is not installed
      if (checkMobile() && !isAppInstalled) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      // Log install to analytics
      console.log("PWA was installed");
      setShowInstallPrompt(false);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
    };
  }, []);

  useEffect(() => alert(`IS STANDALONE: ${isStandalone}`), [isStandalone]);

  const handleInstallClick = (): void => {
    if (!installEvent) return;

    // Show the install prompt
    installEvent.prompt();

    // Wait for the user to respond to the prompt
    installEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setInstallEvent(null);
    });
  };

  // iOS specific instructions since it doesn't support beforeinstallprompt
  const isIOS: boolean =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  if (isStandalone) {
    // Already installed as PWA, show the app
    return <>{children}</>;
  }

  if (showInstallPrompt || (isMobile && !isStandalone)) {
    return (
      <div
        className="install-prompt-container"
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
          backgroundColor: "#fff",
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
            style={{
              backgroundColor: "#4285f4",
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
          onClick={() => setShowInstallPrompt(false)}
          style={{
            backgroundColor: "transparent",
            color: "#666",
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

  // Not mobile or user dismissed the prompt, show the app
  return <>{children}</>;
};

export default InstallPrompt;
