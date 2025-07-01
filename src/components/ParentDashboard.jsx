import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ParentDashboard() {
  const [enfant, setEnfant] = useState(() => {
    const savedEnfant = localStorage.getItem('enfant');
    return savedEnfant || '';
  });

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [suivi, setSuivi] = useState([]);
  const [presence, setPresence] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enfant) {
      window.location.href = '/'; // Redirection vers la page de connexion si pas d'enfant
    }
  }, [enfant]);

  const fetchData = async () => {
    if (!enfant) {
      setError('Enfant non trouvé');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('ID de l\'enfant:', enfant);
      
      // Vérifier si l\'enfant existe dans la base de données
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('enfant', enfant)
        .single();

      if (profileError) {
        console.error('Erreur lors de la vérification du profil:', profileError);
        setError('Erreur: Enfant non trouvé dans la base de données');
        return;
      }

      // Construire les noms des tables
      const suiviTable = `suivi_${enfant}`;
      const presenceTable = `presence_${enfant}`;
      const photosTable = `photos_${enfant}`;

      console.log('Tables à charger:', { suiviTable, presenceTable, photosTable });

      const [suiviRes, presenceRes, photosRes] = await Promise.all([
        supabase.from(suiviTable)
          .select("*")
          .eq("date", date)
          .order("heure", { ascending: false }),
        supabase.from(presenceTable)
          .select("*")
          .eq("date", date)
          .order("heure_arrive", { ascending: false }),
        supabase.from(photosTable).select("*").order("date", { ascending: false }),
      ]);

      // Afficher les erreurs spécifiques
      if (suiviRes.error) {
        console.error('Erreur suivi:', suiviRes.error);
      }
      if (presenceRes.error) {
        console.error('Erreur présence:', presenceRes.error);
      }
      if (photosRes.error) {
        console.error('Erreur photos:', photosRes.error);
      }

      // Utiliser les données même si certaines requêtes échouent
      setSuivi(suiviRes.data || []);
      setPresence(presenceRes.data || []);
      setPhotos(photosRes.data || []);

      // Afficher un message d'erreur spécifique si toutes les requêtes échouent
      if (suiviRes.error && presenceRes.error && photosRes.error) {
        setError('Erreur lors du chargement des données');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord parent</h1>
        <p className="text-gray-600">Bienvenue dans l'espace de suivi de votre {enfant}</p>
      </div>
      <div className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Voir
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-2 py-1 rounded"
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Suivi des activités</h2>
        {suivi.length === 0 ? (
          <p className="text-gray-500">Aucun suivi pour cette date.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suivi.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {item.heure}
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {item.activite}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-gray-700 text-sm">{item.observation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Présence</h2>
        {presence.length === 0 ? (
          <p className="text-gray-500">Aucune présence pour cette date.</p>
        ) : (
          <div className="space-y-3">
            {presence.map((item) => (
              <div key={item.id} className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="text-center text-sm">
                  <span className="font-medium text-gray-700">
                    {item.heure_arrive || '--:--'}
                  </span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="font-medium text-gray-700">
                    {item.heure_depart || '--:--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-6">Photos</h2>
        {photos.length === 0 ? (
          <p className="text-gray-500">Aucune photo.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt={`Photo du ${photo.date}`}
                  className="rounded w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-sm">{photo.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
