import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ParentDashboard({ user }) {
  const [enfant, setEnfant] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [suivi, setSuivi] = useState([]);
  const [presence, setPresence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'enfant lié au parent
  useEffect(() => {
    const fetchEnfant = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("enfant")
        .eq("user_id", user.id)
        .single();

      if (error) setError("Impossible de récupérer l'enfant");
      else setEnfant(data.enfant);
    };

    fetchEnfant();
  }, [user]);

  // Fonction pour charger suivi et présence
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

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {error}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord parent</h1>
        <p className="text-gray-600">Bienvenue dans l'espace de suivi de {enfant}</p>
      </div>

      <div className="flex justify-between items-center mb-6 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-2 py-1 rounded"
          max={new Date().toISOString().split("T")[0]}
        />
        <button
          onClick={fetchData}
          className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Voir
        </button>
      </div>

      {/* Suivi */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Suivi des activités</h2>
        {suivi.length === 0 ? (
          <p className="text-gray-500">Aucun suivi pour cette date.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {suivi.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-gray-700 font-medium">{item.heure}</span>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{item.activite}</span>
                  <span className="text-gray-700">{item.observation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Présence */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Présence</h2>
        {presence.length === 0 ? (
          <p className="text-gray-500">Aucune présence pour cette date.</p>
        ) : (
          <div className="space-y-3">
            {presence.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm text-center">
                <span className="font-medium text-gray-700">{item.heure_arrive || "--:--"}</span>
                <span className="mx-2 text-gray-400">—</span>
                <span className="font-medium text-gray-700">{item.heure_depart || "--:--"}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
