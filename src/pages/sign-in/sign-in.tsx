import { Auth } from "@supabase/auth-ui-react";
import { supabase } from "@/lib/supabase";
import { useThemeContext } from "@/hooks";
import { getThemeObject } from "./helpers";

export const SignIn = () => {
  const { theme } = useThemeContext();
  return (
    <div className="h-full bg-surface-0 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col bg-surface-1 bg-gradient-to-br from-surface-1 to-surface-mid py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <span className="w-full flex flex-col gap-2 items-center justify-center">
            <img className="w-24 h-24" src="/logo192.png" />
            <h2 className="font-semibold text-lg text-surface-8">
              Velocity Studio
            </h2>
          </span>

          <Auth
            supabaseClient={supabase}
            appearance={{ theme: getThemeObject(theme) }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/app/projects`}
          />
        </div>
      </div>
    </div>
  );
};
