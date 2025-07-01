import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import AjouterSuivi from "./AjouterSuivi";
import AjouterPresence from "./AjouterPresence";
import AjouterPhoto from "./AjouterPhoto";

export default function NounouDashboard() {
  // États
  const [enfant, setEnfant] = useState("caly");
  const [suivi, setSuivi] = useState([]);
  const [presence, setPresence] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editingPresence, setEditingPresence] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onglet, setOnglet] = useState("suivi");

  // Fonctions de chargement
  const fetchSuivi = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from(`suivi_${enfant}`)
        .select("*")
        .eq("date", today)
        .order("heure", { ascending: false });

      if (error) throw error;
      console.log('Données de suivi chargées:', data);
      setSuivi(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des suivis");
      setSuivi([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresence = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from(`presence_${enfant}`)
        .select("*")
        .eq("date", today)
        .order("heure_arrive", { ascending: false });

      if (error) throw error;
      console.log('Données de présence chargées:', data);
      setPresence(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des présences");
      setPresence([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(`photos_${enfant}`)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des photos");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    fetchSuivi();
    fetchPresence();
    fetchPhotos();
  }, [enfant]);

  // Gestion des actions
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce suivi ?")) {
      try {
        const { error } = await supabase
          .from(`suivi_${enfant}`)
          .delete()
          .eq("id", id);

        if (error) throw error;
        await fetchSuivi();
        setMessage("Suivi supprimé avec succès");
      } catch (err) {
        setError(err.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleDeletePresence = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette présence ?")) {
      try {
        const { error } = await supabase
          .from(`presence_${enfant}`)
          .delete()
          .eq("id", id);

        if (error) throw error;
        await fetchPresence();
        setMessage("Présence supprimée avec succès");
      } catch (err) {
        setError(err.message || "Erreur lors de la suppression de la présence");
      }
    }
  };

  const handleDeletePhoto = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette photo ?")) {
      try {
        const { error } = await supabase
          .from(`photos_${enfant}`)
          .delete()
          .eq("id", id);

        if (error) throw error;
        await fetchPhotos();
        setMessage("Photo supprimée avec succès");
      } catch (err) {
        setError(err.message || "Erreur lors de la suppression de la photo");
      }
    }
  };

  // Rendu JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-pink-600">
                Tableau de bord Nounou
              </h1>
              <p className="text-gray-600 mt-1">Gérez le suivi des enfants</p>
            </div>
            <div className="mt-4 md:mt-0">
              <select
                value={enfant}
                onChange={(e) => {
                  setEnfant(e.target.value);
                  setEditingItem(null);
                  setEditingPresence(null);
                  setMessage("");
                }}
                className="form-select w-full sm:w-auto rounded-lg border-pink-300 focus:border-pink-500 focus:ring-pink-500 text-center"
              >
                <option value="caly">Caly</option>
                <option value="nate">Nate</option>
              </select>
            </div>
          </div>

          {message && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
              {message}
            </div>
          )}
        </div>

        {/* Section Suivi */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-600">
            Suivi des activités
          </h2>
          <p className="text-gray-600 mb-6">
            Suivez les activités et le développement de l'enfant
          </p>
          
          <AjouterSuivi enfant={enfant} onAjoute={fetchSuivi} />
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : suivi.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun suivi pour le moment</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Détails
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suivi.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.date ? new Date(item.date + 'T00:00:00').toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.heure ? item.heure.substring(0, 5) : 'Heure inconnue'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.activite}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.observation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section Présence */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-600">
            Gestion des présences
          </h2>
          <p className="text-gray-600 mb-6">
            Enregistrez les heures d'arrivée et de départ
          </p>
          
          <AjouterPresence enfant={enfant} onPresenceAdded={fetchPresence} />
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : presence.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune présence enregistrée aujourd'hui</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure d'arrivée
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heure de départ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presence.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.heure_arrive ? new Date(`2000-01-01T${item.heure_arrive}`).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Non spécifiée'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.heure_depart ? new Date(`2000-01-01T${item.heure_depart}`).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'En cours...'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeletePresence(item.id)}
                          className="text-red-600 hover:text-red-900 mr-4"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section Photos */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-pink-600">
            Galerie photos
          </h2>
          <p className="text-gray-600 mb-6">
            Partagez les moments importants de la journée
          </p>
          
          <AjouterPhoto enfant={enfant} onAjout={fetchPhotos} />
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : photos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune photo partagée pour le moment</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={`Photo de ${enfant}`}
                    className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                  />
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Supprimer la photo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
