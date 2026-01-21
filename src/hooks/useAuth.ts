import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isStaff: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Check staff role after auth state change
        if (session?.user) {
          setTimeout(() => {
            checkStaffRole(session.user.id);
          }, 0);
        } else {
          setIsStaff(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        checkStaffRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkStaffRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .in("role", ["admin", "barber"]);

      if (error) {
        console.error("Error checking staff role:", error);
        setIsStaff(false);
        return;
      }

      setIsStaff(data && data.length > 0);
    } catch (error) {
      console.error("Error checking staff role:", error);
      setIsStaff(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsStaff(false);
  };

  return {
    user,
    session,
    isLoading,
    isStaff,
    isAuthenticated: !!session,
    signOut,
  };
};
