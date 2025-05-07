/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { useLocalStorage } from "usehooks-ts";

// interface Profile {
//   id: string;
//   created_at?: string;
//   updated_at?: string;
//   display_name?: string;
//   avatar_url?: string;
//   storage_used?: number;
//   [key: string]: any;
// }

interface AuthContextType {
  user: User | null;
  // profile: Profile | null;
  signOut: () => Promise<void>;
  // updateProfile: (
  //   updates: Partial<Profile>
  // ) => Promise<{ success: boolean; error?: any }>;
  isLoggedIn: boolean;
  loading: boolean;
}

// Session storage key
const SESSION_STORAGE_KEY = "supabase.auth.session";

const AuthContext = createContext<AuthContextType>({
  user: null,
  // profile: null,
  signOut: async () => {},
  // updateProfile: async () => ({ success: false }),
  isLoggedIn: false,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  // const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [storedSession, setStoredSession] = useLocalStorage<Session | null>(
    SESSION_STORAGE_KEY,
    null
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setStoredSession(session);
          setUser(session.user);
          // fetchUserProfile(session.user.id);
        } else if (storedSession) {
          const { data, error } = await supabase.auth.setSession({
            access_token: storedSession.access_token,
            refresh_token: storedSession.refresh_token,
          });

          if (error) {
            console.error("Error restoring session:", error);
            setStoredSession(null);
            setLoading(false);
          } else if (data?.session) {
            setUser(data.session.user);
            // fetchUserProfile(data.session.user.id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session) {
        setStoredSession(session);
        setUser(session.user);
        // fetchUserProfile(session.user.id);
      } else {
        setStoredSession(null);
        setUser(null);
        // setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [setStoredSession, storedSession]);

  // const fetchUserProfile = async (userId: string) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("profiles")
  //       .select("*")
  //       .eq("id", userId)
  //       .single();

  //     if (error) throw error;
  //     setProfile(data as Profile);
  //   } catch (error) {
  //     console.error("Error fetching profile:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const signOut = async () => {
    setStoredSession(null);
    await supabase.auth.signOut();
  };

  // const updateProfile = async (updates: Partial<Profile>) => {
  //   try {
  //     if (!user) throw new Error("No user logged in");

  //     const { error } = await supabase
  //       .from("profiles")
  //       .update(updates)
  //       .eq("id", user.id);

  //     if (error) throw error;

  //     fetchUserProfile(user.id);
  //     return { success: true };
  //   } catch (error) {
  //     console.error("Error updating profile:", error);
  //     return { success: false, error };
  //   }
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        // profile,
        signOut,
        // updateProfile,
        isLoggedIn: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
