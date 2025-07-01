import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;
        if (!user) return;

        // Utiliser une fonction asynchrone pour une meilleure gestion des erreurs
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("role, enfant")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Erreur lors de la requête profiles:", profileError);
          throw profileError;
        }



        setProfile(data);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
}
