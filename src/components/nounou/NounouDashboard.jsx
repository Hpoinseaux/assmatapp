import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AjouterSuivi from "./AjouterSuivi";
import AjouterPresence from "./AjouterPresence";

export default function NounouDashboard() {
  const [enfant, setEnfant] = useState("caly");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [suivi, setSuivi] = useState([]);
  const [presence, setPresence] = useState([]);
  const [loadingSuivi, setLoadingSuivi] = useState(false);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Récupérer suivi
  const fetchSuivi = async () => {
    try {
      setLoadingSuivi(true);
      const { data, error } = await supabase
        .from("suivi")
        .select("*")
        .eq("enfant", enfant)
        .eq("date", date)
        .order("heure", { ascending: false });
      if (error) throw error;
      setSuivi(data || []);
    } catch (err) {
      setError(err.message);
      setSuivi([]);
    } finally {
      setLoadingSuivi(false);
    }
  };

  // Récupérer présence
  const fetchPresence = async () => {
    try {
      setLoadingPresence(true);
      const { data, error } = await supabase
        .from("presence")
        .select("*")
        .eq("enfant", enfant)
        .eq("date", date)
        .order("heure_arrive", { ascending: false });
      if (error) throw error;
      setPresence(data || []);
    } catch (err) {
      setError(err.message);
      setPresence([]);
    } finally {
      setLoadingPresence(false);
    }
  };

  // Supprimer suivi
  const handleDeleteSuivi = async (id) => {
    if (!window.confirm("Voulez-vous supprimer ce suivi ?")) return;
    try {
      const { error } = await supabase.from("suivi").delete().eq("id", id);
      if (error) throw error;
      fetchSuivi();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchSuivi();
    fetchPresence();
  }, [enfant, date]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-pink-600">Tableau de bord Nounou</h1>
          <div className="flex w-full justify-between items-center gap-4">
            {/* Select enfant à gauche */}
            <div className="flex-1">
              <select
                value={enfant}
                onChange={e => setEnfant(e.target.value)}
                className="w-full rounded border px-3 py-2"
              >
                <option value="caly">Caly</option>
                <option value="nate">Nate</option>
                <option value="sebastien">Sebastien</option>
              </select>
            </div>

            {/* Input date au centre */}
            <div className="flex-1 text-center">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full max-w-xs border rounded px-3 py-2"
              />
            </div>

            {/* Bouton Voir à droite */}
            <div className="flex-1 text-right">
              <button
                onClick={() => { fetchSuivi(); fetchPresence(); }}
                className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                Voir
              </button>
            </div>
          </div>
        </div>

        {/* Suivi */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Suivi des activités</h2>
          <AjouterSuivi enfant={enfant} onAjoute={fetchSuivi} />
          {loadingSuivi ? (
            <p>Chargement suivi...</p>
          ) : suivi.length === 0 ? (
            <p>Aucun suivi pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {suivi.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Heure à gauche */}
                  <div className="w-24 text-left text-gray-700 font-medium">{item.heure}</div>

                  {/* Activité au centre */}
                  <div className="flex-1 text-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                      {item.activite}
                    </span>
                  </div>

                  {/* Observation */}
                  <div className="flex-1 text-left text-gray-700">
                    {item.observation || "Pas d'observation"}
                  </div>

                  {/* Bouton Supprimer */}
                  <div className="w-24 text-right">
                    <button
                      onClick={() => handleDeleteSuivi(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Présence */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Présence</h2>
          <AjouterPresence enfant={enfant} onPresenceAdded={fetchPresence} />
          {loadingPresence ? (
            <p>Chargement présence...</p>
          ) : presence.length === 0 ? (
            <p>Aucune présence pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {presence.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  {/* Date à gauche */}
                  <div className="w-32 text-left text-gray-700 font-medium">
                    {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : "Date inconnue"}
                  </div>

                  {/* Heure d'arrivée au centre gauche */}
                  <div className="flex-1 text-center text-green-700 font-medium">
                    {item.heure_arrive || "--:--"}
                  </div>

                  {/* Heure de départ au centre droit */}
                  <div className="flex-1 text-center text-red-700 font-medium">
                    {item.heure_depart || "--:--"}
                  </div>

                  {/* Durée à droite */}
                  <div className="w-24 text-right text-gray-700 font-medium">
                    {item.duree || "--:--"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
