/* eslint-disable @typescript-eslint/no-explicit-any */
import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useThemeContext } from "@/hooks";
import { getThemeObject } from "./helpers";
// import { useAuth } from "@/context/auth-context";
import { useState, useEffect } from "react";

export const SignIn = () => {
  const { theme } = useThemeContext();
  // const { isLoggedIn } = useAuth();
  const [isStandalone, setIsStandalone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStandalone = () => {
      const isInStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsStandalone(isInStandaloneMode);
      console.log("App is running in standalone mode:", isInStandaloneMode);
    };

    checkStandalone();

    const mediaQueryList = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mediaQueryList.addEventListener("change", handleChange);

    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  // Handle Google Sign In with popup for PWA mode
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Using Supabase's skipBrowserRedirect option
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true, // This prevents automatic redirect
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Open the URL in a popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popupWindow = window.open(
          data.url,
          "google-signin-popup",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popupWindow) {
          throw new Error("Popup was blocked by the browser");
        }

        // Set up a broadcast channel for communication
        const channel = new BroadcastChannel("auth-channel");

        channel.addEventListener("message", (event) => {
          if (event.data.type === "AUTH_COMPLETE") {
            channel.close();
            popupWindow.close();
            setLoading(false);
            // Refresh the session
            supabase.auth.getSession().then(() => {
              // Redirect to projects page or update UI as needed
              window.location.href = `${window.location.origin}/app/projects`;
            });
          }
        });
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);

      // Fallback to redirect if popup fails
      if ((err as Error).message?.includes("blocked")) {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/app/projects`,
          },
        });
      }
    }
  };

  return (
    <div className="h-full md:w-full overflow-y-auto bg-surface-0 flex flex-col py-4 px-2 sm:px-6 lg:px-8">
      <div className="w-full flex-grow flex items-center justify-center">
        <div className="w-full lg:max-w-md">
          <div className="md:w-full flex flex-col bg-surface-1 bg-gradient-to-br from-surface-1 to-surface-mid py-6 px-4 shadow rounded-lg sm:px-8">
            <span className="w-full flex flex-col gap-2 items-center justify-center mb-2">
              <img
                className="w-16 h-16 lg:w-20 lg:h-20"
                src="/logo192.png"
                alt="Velocity Studio logo"
              />
              <h2 className="font-semibold text-lg text-surface-8">
                Velocity Studio
              </h2>
            </span>

            {isStandalone ? (
              // Custom Google Sign In button for PWA mode
              <div className="mt-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-surface-3 rounded-md shadow-sm text-sm font-medium text-surface-7 bg-surface-2 hover:bg-surface-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-5"
                >
                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#FFC107"
                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            ) : (
              // Regular Auth UI for browser mode
              <Auth
                supabaseClient={supabase}
                appearance={{
                  theme: getThemeObject(theme),
                }}
                providers={["google"]}
                redirectTo={`${window.location.origin}/app/projects`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
