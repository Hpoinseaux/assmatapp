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

  useEffect(() => {
    fetchSuivi();
    fetchPresence();
  }, [enfant, date]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-pink-600">Tableau de bord Nounou</h1>
          <div className="flex gap-2">
            <select value={enfant} onChange={e => setEnfant(e.target.value)} className="rounded border px-2 py-1">
              <option value="caly">Caly</option>
              <option value="nate">Nate</option>
              <option value="sebastien">Sebastien</option>
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                   max={new Date().toISOString().split("T")[0]} className="border rounded px-2 py-1"/>
            <button onClick={() => { fetchSuivi(); fetchPresence(); }} className="px-4 py-1 bg-pink-500 text-white rounded hover:bg-pink-600">Voir</button>
          </div>
        </div>

        {/* Suivi */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <AjouterSuivi enfant={enfant} onAjoute={fetchSuivi}/>
          {loadingSuivi ? (
            <p>Chargement suivi...</p>
          ) : suivi.length === 0 ? (
            <p>Aucun suivi pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {suivi.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                  <span>{item.heure}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">{item.activite}</span>
                  <span>{item.observation}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Présence */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <AjouterPresence enfant={enfant} onPresenceAdded={fetchPresence}/>
          {loadingPresence ? (
            <p>Chargement présence...</p>
          ) : presence.length === 0 ? (
            <p>Aucune présence pour cette date.</p>
          ) : (
            <div className="space-y-2">
              {presence.map(item => (
                <div key={item.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                  <span>{item.heure_arrive || "--:--"}</span>
                  <span>{item.heure_depart || "--:--"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
