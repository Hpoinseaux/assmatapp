import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ParentDashboard() {
  const [user, setUser] = useState(null);
  const [enfant, setEnfant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [suivi, setSuivi] = useState([]);
  const [presence, setPresence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  // Récupérer l'enfant lié au parent
  useEffect(() => {
    const fetchEnfant = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("enfant")
        .eq("user_id", user.id)
        .single();

      if (error) {
        setError("Impossible de récupérer l'enfant");
      } else {
        setEnfant(data.enfant);
      }
    };

    fetchEnfant();
  }, [user]);

  // Charger suivi et présence
  useEffect(() => {
    const fetchData = async () => {
      if (!enfant) return;

      try {
        setLoading(true);
        setError(null);

        const { data: suiviData, error: suiviError } = await supabase
          .from("suivi")
          .select("*")
          .eq("enfant", enfant)
          .eq("date", date)
          .order("heure", { ascending: false });

        const { data: presenceData, error: presenceError } = await supabase
          .from("presence")
          .select("*")
          .eq("enfant", enfant)
          .eq("date", date)
          .order("heure_arrive", { ascending: false });

        if (suiviError || presenceError) {
          setError("Erreur lors du chargement des données");
        } else {
          setSuivi(suiviData || []);
          setPresence(presenceData || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [enfant, date]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord parent</h1>
      <p>Enfant: {enfant}</p>

      {/* Suivi */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Suivi des activités</h2>
        {suivi.length === 0 ? (
          <p>Aucun suivi pour cette date.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suivi.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex justify-between mb-2">
                  <span>{item.heure}</span>
                  <span>{item.activite}</span>
                </div>
                <p>{item.observation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Présence */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Présence</h2>
        {presence.length === 0 ? (
          <p>Aucune présence pour cette date.</p>
        ) : (
          <div className="space-y-3">
            {presence.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg shadow-sm text-center">
                <span>{item.heure_arrive || "--:--"}</span>
                <span className="mx-2">—</span>
                <span>{item.heure_depart || "--:--"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

