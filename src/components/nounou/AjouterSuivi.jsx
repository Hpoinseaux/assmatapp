import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AjouterSuivi({ onAjoute, enfant }) {
  // Liste des activités
  const ACTIVITES = [
    { type: 'quotidien', label: 'Repas' },
    { type: 'quotidien', label: 'Début sieste' },
    { type: 'quotidien', label: 'Fin sieste' },
    { type: 'quotidien', label: 'Goûter' },
    { type: 'soins', label: 'Soins' },
    { type: 'soins', label: 'Change' },
    { type: 'soins', label: 'Besoins' }
  ];

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [heure, setHeure] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  const [activite, setActivite] = useState("");
  const [observation, setObservation] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setHeure(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setActivite("");
    setObservation("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Insertion dans la table:', `suivi_${enfant}`);
      console.log('Données à insérer:', {
        date,
        heure,
        activite,
        observation,
        enfant
      });

      const { data, error } = await supabase
        .from(`suivi_${enfant}`)
        .insert({
          date,
          heure,
          activite,
          observation
        })
        .select();

      if (error) {
        console.error('Erreur:', error);
        throw error;
      }
      console.log('Données insérées:', data);

      setMessage("Suivi ajouté avec succès !");
      resetForm();
      onAjoute && onAjoute();
    } catch (error) {
      setError(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-blue-50 rounded-xl shadow-md p-4">


      <div className="grid grid-cols-2 gap-4">
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

        <div className="space-y-2">
          <label className="block text-pink-600">Heure</label>
          <input 
            type="time" 
            value={heure} 
            onChange={(e) => setHeure(e.target.value)} 
            required 
            className="form-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-pink-600">Activité</label>
          <select 
            value={activite} 
            onChange={(e) => setActivite(e.target.value)} 
            required 
            className="form-input w-full"
          >
            <option value="">Sélectionnez une activité</option>
            {ACTIVITES.map((activite) => (
              <option key={activite.label} value={activite.label}>
                {activite.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-pink-600">Observation</label>
          <input
            type="text"
            placeholder="Observation" 
            value={observation} 
            onChange={(e) => setObservation(e.target.value)}
            className="form-input w-full"
          />
        </div>
      </div>

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
          'Ajouter l\'activité'
        )}
      </button>

      {error && (
        <div className="message-error">
          {error}
        </div>
      )}
      {message && (
        <div className="message-success">
          {message}
        </div>
      )}
    </form>
  );
}
