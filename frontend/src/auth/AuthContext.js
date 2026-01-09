import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);


  useEffect(() => {
    let mounted = true;

    
    async function loadProfile(userId) {
      if (!userId) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!mounted) return;

      if (error) {
        console.error("loadProfile error:", error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    }

    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {

        if (!mounted) return;
        if (error) console.error("getSession error:", error);

        const s = data?.session ?? null;
        setSession(s);
        setUser(s?.user ?? null);
        await loadProfile(s?.user?.id);
        setLoading(false);
      })
      .catch((err) => {
        console.error("getSession exception:", err);
        if (!mounted) return;
        setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setUser(newSession?.user ?? null);
      loadProfile(newSession?.user?.id);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      role: profile?.role ?? null,
      loading,
      signOut: () => supabase.auth.signOut(),
    }),
    [session, user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
