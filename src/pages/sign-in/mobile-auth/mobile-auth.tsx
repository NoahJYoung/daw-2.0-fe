import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { FcGoogle } from "react-icons/fc";

export const MobileAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
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
          if (event.data.type === "AUTH_COMPLETE") {
            channel.close();
            popupWindow.close();
            setLoading(false);

            supabase.auth.getSession().then(() => {
              window.location.href = `${window.location.origin}/app/projects`;
            });
          }
        });
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);

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

  const handleSignInWithEmailAndPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate({ to: `${window.location.origin}/app/projects` });
    } catch (error) {
      setError(`Sign in failed. ${(error as Error).message ?? ""}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            <FcGoogle />
            Sign in with Google
          </>
        )}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <hr className="my-4 border-surface-5" />
      <form
        onSubmit={handleSignInWithEmailAndPassword}
        className="flex flex-col w-full gap-3 justify-evenly"
      >
        <div>
          <label htmlFor="email" className="text-sm text-surface-6">
            Email address
          </label>
          <Input
            className="text-surface-7"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-surface-6">
            Your password
          </label>
          <Input
            className="text-surface-7"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="my-2 text-white bg-brand-1">
          Sign in
        </Button>
      </form>
    </div>
  );
};
