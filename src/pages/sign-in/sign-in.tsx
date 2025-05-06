import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useThemeContext } from "@/hooks";
import { getThemeObject } from "./helpers";
import { useAuth } from "@/context/auth-context";
import { Navigate } from "@tanstack/react-router";

export const SignIn = () => {
  const { theme } = useThemeContext();
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? (
    <Navigate to="/app" />
  ) : (
    <div className="h-full md:w-full overflow-y-auto bg-surface-0 flex flex-col py-4 px-2 sm:px-6 lg:px-8">
      <div className="w-full flex-grow flex items-center justify-center">
        <div className="w-full lg:max-w-md">
          <div className="md:w-full flex flex-col bg-surface-1 bg-gradient-to-br from-surface-1 to-surface-mid py-6 px-4 shadow rounded-lg sm:px-8">
            <span className="w-full flex flex-col gap-2 items-center justify-center mb-2">
              <img className="w-16 h-16 lg:w-20 lg:h-20" src="/logo192.png" />
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
  );
};
