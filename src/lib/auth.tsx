import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "./supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Failed to fetch session', error);
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch profile
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              logger.error('Failed to fetch user profile', error);
              // Sign out if profile can't be loaded
              supabase.auth.signOut();
              setUser(null);
              setProfile(null);
            } else if (data?.is_blocked) {
              // Immediately sign out blocked users
              logger.warn('Blocked user attempted to access', { userId: session.user.id });
              supabase.auth.signOut();
              setUser(null);
              setProfile(null);
            } else {
              setProfile(data ?? null);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (error) {
              logger.error('Failed to fetch user profile on auth change', error);
              supabase.auth.signOut();
              setUser(null);
              setProfile(null);
            } else if (data?.is_blocked) {
              logger.warn('Blocked user attempted to access', { userId: session.user.id });
              supabase.auth.signOut();
              setUser(null);
              setProfile(null);
            } else {
              setProfile(data ?? null);
            }
            setLoading(false);
          });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Sign in failed', error, { email });
      return { error: error.message };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signOut,
        isAdmin: profile?.role === "admin",
        isEditor: profile?.role === "editor",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
