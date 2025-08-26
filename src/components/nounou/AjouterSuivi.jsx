import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AjouterSuivi({ onAjoute, enfant }) {
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      const { data, error } = await supabase
        .from("suivi")
        .insert({ date, heure, activite, observation, enfant })
        .select();

      if (error) throw error;

      setMessage("Suivi ajouté avec succès !");
      resetForm();
      onAjoute && onAjoute();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-md space-y-4">
      {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">{message}</div>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">{error}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-gray-700 font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-gray-700 font-medium">Heure</label>
          <input
            type="time"
            value={heure}
            onChange={(e) => setHeure(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-gray-700 font-medium">Activité</label>
          <select
            value={activite}
            onChange={(e) => setActivite(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
            required
          >
            <option value="">Sélectionnez une activité</option>
            {ACTIVITES.map(a => (
              <option key={a.label} value={a.label}>{a.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-gray-700 font-medium">Observation</label>
          <input
            type="text"
            placeholder="Observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "En cours..." : "Ajouter l'activité"}
      </button>
    </form>
  );
}
