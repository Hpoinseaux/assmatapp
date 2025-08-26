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

  // Fonction fetchData définie séparément
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

  // Appel initial des données dès qu'on a l'enfant
  useEffect(() => {
    fetchData();
  }, [enfant, date])
  
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tableau de bord parent</h1>
        <p className="text-gray-600 text-lg">Bienvenue dans l'espace de suivi de <span className="font-medium">{enfant}</span></p>
      </div>
  
      {/* Filtre par date */}
      <div className="flex w-full items-center gap-4">
        {/* Date à gauche */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex-1"
          max={new Date().toISOString().split("T")[0]}
        />

        {/* Bouton à droite */}
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Voir
        </button>
      </div>

  
      {/* Suivi */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Suivi des activités</h2>
        {suivi.length === 0 ? (
          <p className="text-gray-500">Aucun suivi pour cette date.</p>
        ) : (
          <div className="space-y-2">
            {suivi.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
              >
                {/* Heure à gauche */}
                <div className="w-24 text-left">
                  <span className="text-gray-700 font-semibold">{item.heure}</span>
                </div>

                {/* Activité au centre */}
                <div className="flex-1 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-medium">{item.activite}</span>
                </div>

                {/* Observation à droite */}
                <div className="w-1/3 text-right">
                  <span className="text-gray-700">{item.observation || "Pas d'observation"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
  
      {/* Présence */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Présence</h2>
        {presence.length === 0 ? (
          <p className="text-gray-500">Aucune présence pour cette date.</p>
        ) : (
          <div className="space-y-2">
            {presence.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow"
              >
                {/* Date à gauche */}
                <div className="w-32 text-left text-gray-700 font-medium">
                  {item.date ? new Date(item.date).toLocaleDateString("fr-FR") : "Date inconnue"}
                </div>

                {/* Heure arrivée au centre gauche */}
                <div className="w-24 text-center text-green-700 font-medium">
                  {item.heure_arrive || "--:--"}
                </div>

                {/* Heure départ au centre droit */}
                <div className="w-24 text-center text-red-700 font-medium">
                  {item.heure_depart || "--:--"}
                </div>

                {/* Durée à droite */}
                <div className="w-32 text-right text-gray-700 font-medium">
                  {item.duree || "--:--"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
