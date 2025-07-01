import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({
  session: null,
  signIn: () => Promise.reject(new Error('Not authenticated')),
  signOut: () => Promise.reject(new Error('Not authenticated')),
  loading: true,
  error: null,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    loading,
    error,
    signIn: async (email, password) => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSession(data.session);
        return data;
      } catch (err) {
        setError(err.message || 'Erreur lors de la connexion');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    signOut: async () => {
      try {
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setSession(null);
      } catch (err) {
        setError(err.message || 'Erreur lors de la déconnexion');
        throw err;
      } finally {
        setLoading(false);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };

export function useAuth() {
  return useContext(AuthContext);
}
