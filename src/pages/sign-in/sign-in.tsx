import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useThemeContext } from "@/hooks";
import { getThemeObject } from "./helpers";
import { useAuth } from "@/context/auth-context";
import { Navigate } from "@tanstack/react-router";
import { isInStandaloneMode, isMobileDevice } from "../studio/utils";

export const SignIn = () => {
  const { theme } = useThemeContext();
  const { isLoggedIn } = useAuth();
  const usePopupAuth = isInStandaloneMode() || isMobileDevice();

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const width = 1200;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        console.log(data);

        const popupWindow = window.open(
          data.url,
          "google-signin-popup",
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popupWindow) {
          throw new Error("Popup was blocked by the browser");
        }

        const channel = new BroadcastChannel("auth-channel");

        channel.addEventListener("message", (event) => {
          console.log(event);
          if (event.data.type === "AUTH_COMPLETE") {
            channel.close();
            popupWindow.close();
            supabase.auth.getSession().then(() => {
              window.location.href = `${window.location.origin}/app/projects`;
            });
          }
        });
      }
    } catch (err) {
      console.error("Authentication error:", err);

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

  return isLoggedIn ? (
    <Navigate to="/app" />
  ) : (
    <>
      {usePopupAuth ? (
        <button onClick={handleGoogleSignIn}>log in wih google</button>
      ) : (
        <div className="h-full md:w-full overflow-y-auto bg-surface-0 flex flex-col py-4 px-2 sm:px-6 lg:px-8">
          <div className="w-full flex-grow flex items-center justify-center">
            <div className="w-full lg:max-w-md">
              <div className="md:w-full flex flex-col bg-surface-1 bg-gradient-to-br from-surface-1 to-surface-mid py-6 px-4 shadow rounded-lg sm:px-8">
                <span className="w-full flex flex-col gap-2 items-center justify-center mb-2">
                  <img
                    className="w-16 h-16 lg:w-20 lg:h-20"
                    src="/logo192.png"
                  />
                  <h2 className="font-semibold text-lg text-surface-8">
                    Velocity Studio
                  </h2>
                </span>

                <Auth
                  supabaseClient={supabase}
                  appearance={{
                    theme: getThemeObject(theme),
                  }}
                  providers={["google"]}
                  redirectTo={`${window.location.origin}/app/projects`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
