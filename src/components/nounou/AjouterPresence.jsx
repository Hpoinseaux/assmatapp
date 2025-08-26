import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AjouterPresence({ onPresenceAdded, enfant }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [heureArrivee, setHeureArrivee] = useState(
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
  const [heureDepart, setHeureDepart] = useState("");
  const [etape, setEtape] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (etape === 1) {
        // Vérifier si présence déjà existante pour cet enfant/date
        const { data: existingData, error: searchError } = await supabase
          .from("presence")
          .select("*")
          .eq("enfant", enfant)
          .eq("date", date)
          .eq("heure_arrive", heureArrivee);

        if (searchError) throw searchError;
        if (existingData.length > 0) throw new Error("Cette heure d'arrivée existe déjà");

        // Insérer la présence
        const { data, error: insertError } = await supabase
          .from("presence")
          .insert({
            enfant,
            date,
            heure_arrive: heureArrivee,
            heure_depart: null,
            duree: null
          })
          .select();

        if (insertError) throw insertError;

        setMessage("Heure d'arrivée enregistrée avec succès !");
        setEtape(2);
        onPresenceAdded && onPresenceAdded();

      } else {
        if (!heureDepart) throw new Error("L'heure de départ est obligatoire");

        // Récupérer l'entrée existante
        const { data: presenceData, error: presenceError } = await supabase
          .from("presence")
          .select("*")
          .eq("enfant", enfant)
          .eq("date", date)
          .eq("heure_arrive", heureArrivee);

        if (presenceError) throw presenceError;
        if (!presenceData || presenceData.length === 0)
          throw new Error("Aucune présence trouvée pour cette heure d'arrivée");

        const entry = presenceData[0];

        // Calcul de la durée en minutes
        const [h1, m1] = heureArrivee.split(":").map(Number);
        const [h2, m2] = heureDepart.split(":").map(Number);
        const dureeMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        const duree = `00:${dureeMinutes}`; // ou autre format adapté

        // Mettre à jour l'entrée
        const { error: updateError } = await supabase
          .from("presence")
          .update({
            heure_depart: heureDepart,
            duree
          })
          .eq("id", entry.id);

        if (updateError) throw updateError;

        setMessage("Présence complète enregistrée !");
        setEtape(1);
        setHeureArrivee(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        setHeureDepart("");
        onPresenceAdded && onPresenceAdded();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {message && <div className="text-green-700 mb-2">{message}</div>}
      {error && <div className="text-red-700 mb-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-blue-50 p-4 rounded-lg shadow">
        <div>
          <label className="block text-pink-600 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
                 className="border rounded px-2 py-1 w-full" required />
        </div>

        {etape === 1 && (
          <div>
            <label className="block text-pink-600 mb-1">Heure d'arrivée</label>
            <input type="time" value={heureArrivee} onChange={e => setHeureArrivee(e.target.value)}
                   className="border rounded px-2 py-1 w-full" required />
          </div>
        )}

        {etape === 2 && (
          <div>
            <label className="block text-pink-600 mb-1">Heure de départ</label>
            <input type="time" value={heureDepart} onChange={e => setHeureDepart(e.target.value)}
                   className="border rounded px-2 py-1 w-full" required />
          </div>
        )}

        <div className="flex justify-end gap-2">
          {etape === 2 && (
            <button type="button" onClick={() => { setEtape(1); setHeureDepart(""); }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Nouvelle arrivée
            </button>
          )}
          <button type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {loading ? "En cours..." : (etape === 1 ? "Enregistrer arrivée" : "Enregistrer départ")}
          </button>
        </div>
      </form>
    </div>
  );
}
