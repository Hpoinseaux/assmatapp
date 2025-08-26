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

  // Récupérer suivi et présence
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

  useEffect(() => {
    fetchData();
  }, [enfant, date]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord parent</h1>
          <div className="flex w-full sm:w-auto items-center gap-4 mt-4 sm:mt-0">
            {/* Date */}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
              max={new Date().toISOString().split("T")[0]}
            />

            {/* Bouton Voir */}
            <button
              onClick={fetchData}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Voir
            </button>
          </div>
        </div>

        {/* Suivi */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Suivi des activités</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : suivi.length === 0 ? (
            <p className="text-gray-500">Aucun suivi pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {suivi.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Heure */}
                  <div className="w-24 text-left text-gray-700 font-medium">{item.heure}</div>

                  {/* Activité */}
                  <div className="flex-1 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-medium">
                      {item.activite}
                    </span>
                  </div>

                  {/* Observation */}
                  <div className="flex-1 text-left text-gray-700">{item.observation || "Pas d'observation"}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Présence */}
        <section className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Présence</h2>
          {loading ? (
            <p>Chargement...</p>
          ) : presence.length === 0 ? (
            <p className="text-gray-500">Aucune présence pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {presence.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Date */}
                  <div className="w-32 text-left text-gray-700 font-medium">{item.date ? new Date(item.date).toLocaleDateString("fr-FR") : "Date inconnue"}</div>

                  {/* Heure arrivée */}
                  <div className="flex-1 text-center text-green-700 font-medium">{item.heure_arrive || "--:--"}</div>

                  {/* Heure départ */}
                  <div className="flex-1 text-center text-red-700 font-medium">{item.heure_depart || "--:--"}</div>

                  {/* Durée */}
                  <div className="w-32 text-right text-gray-700 font-medium">{item.duree || "--:--"}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
