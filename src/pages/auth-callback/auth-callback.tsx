import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const AuthCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth error:", error);
        return;
      }

      if (data.session && window.opener) {
        try {
          const channel = new BroadcastChannel("auth-channel");
          channel.postMessage({ type: "AUTH_COMPLETE", session: data.session });
          channel.close();
        } catch (err) {
          console.error("BroadcastChannel error:", err);
        }
      } else if (data.session) {
        window.location.href = `${window.location.origin}/app/projects`;
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-0">
      <p className="text-surface-7">Completing authentication...</p>
    </div>
  );
};
