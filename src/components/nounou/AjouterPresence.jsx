import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AjouterPresence({ onPresenceAdded, enfant }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [heureArrivee, setHeureArrivee] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  const [heureDepart, setHeureDepart] = useState("");
  const [etape, setEtape] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const table = `presence_${enfant}`;

    if (etape === 1) {
      // Étape 1 : Enregistrer l'heure d'arrivée
      if (!date || !heureArrivee) {
        setError("La date et l'heure d'arrivée sont obligatoires");
        return;
      }

      try {
        setError(null);
        console.log('Insertion:', { date, heure_arrive: heureArrivee });

        // Vérifier s'il existe déjà une entrée pour cette date/heure d'arrivée
        const { data: existingData, error: searchError } = await supabase
          .from(`presence_${enfant}`)
          .select('*')
          .eq('date', date)
          .eq('heure_arrive', heureArrivee);

        if (searchError) {
          console.error('Erreur recherche:', searchError);
          throw searchError;
        }

        if (existingData && existingData.length > 0) {
          throw new Error('Cette heure d\'arrivée existe déjà pour cette date');
        }

        // Si pas d'entrée existante, créer une nouvelle entrée avec heure_depart NULL
        const { data, error } = await supabase
          .from(`presence_${enfant}`)
          .insert({
            date,
            heure_arrive: heureArrivee,
            heure_depart: '00:00',  // Valeur par défaut
            duree: null
          })
          .select();

        if (error) {
          console.error('Erreur insertion:', error);
          throw error;
        }
        console.log('Données insérées:', data);

        setMessage("Heure d'arrivée enregistrée avec succès !");
        setEtape(2);
        onPresenceAdded && onPresenceAdded();
      } catch (err) {
        setError(err.message || "Erreur lors de l'enregistrement");
      } finally {
        setLoading(false);
      }
    } else {
      // Étape 2 : Enregistrer l'heure de départ
      if (!heureDepart) {
        setError("L'heure de départ est obligatoire");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Mise à jour:', { date, heure_arrive: heureArrivee, heure_depart: heureDepart });

        const { data: presenceData, error: presenceError } = await supabase
          .from(`presence_${enfant}`)
          .select('*')
          .eq('date', date)
          .eq('heure_arrive', heureArrivee);

        if (presenceError) {
          console.error('Erreur recherche:', presenceError);
          throw presenceError;
        }

        if (!presenceData || presenceData.length === 0) {
          throw new Error('Aucune présence trouvée pour cette date/heure d\'arrivée');
        }

        // On prend la première entrée trouvée
        const entry = presenceData[0];

        console.log('Données trouvées:', presenceData);

        const { error: updateError } = await supabase
          .from(`presence_${enfant}`)
          .update({
            heure_depart: heureDepart
          })
          .eq('id', entry.id);

        if (updateError) {
          console.error('Erreur mise à jour:', updateError);
          throw updateError;
        }

        setMessage("Présence complète enregistrée avec succès !");
        setDate("");
        setHeureArrivee("");
        setHeureDepart("");
        setEtape(1);
        onPresenceAdded && onPresenceAdded();
      } catch (err) {
        setError(err.message || "Erreur lors de l'enregistrement");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">

      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {error && (
        <div className="message-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-blue-50 rounded-xl shadow-md p-4">
        <div className="space-y-2">
          <label className="block text-pink-600">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            className="form-input w-full"
          />
        </div>

        {etape === 1 && (
          <div className="space-y-2">
            <label className="block text-pink-600">Heure d'arrivée</label>
            <input 
              type="time" 
              value={heureArrivee} 
              onChange={(e) => setHeureArrivee(e.target.value)} 
              required 
              className="form-input w-full"
            />
          </div>
        )}

        {etape === 2 && (
          <div className="space-y-2">
            <label className="block text-pink-600">Heure de départ</label>
            <input 
              type="time" 
              value={heureDepart} 
              onChange={(e) => setHeureDepart(e.target.value)} 
              required 
              className="form-input w-full"
            />
          </div>
        )}

        {etape === 2 && (
          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={() => {
                setDate("");
                setHeureArrivee("");
                setHeureDepart("");
                setEtape(1);
              }}
              className="mr-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Nouvelle arrivée
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  En cours...
                </>
              ) : (
                'Ajouter la présence'
              )}
            </button>
          </div>
        )}

        {etape === 1 && (
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer arrivée"}
            </button>
          </div>
        )}
      </form>

      {message && (
        <div className="message-success">
          {message}
        </div>
      )}
    </div>
  );
}
