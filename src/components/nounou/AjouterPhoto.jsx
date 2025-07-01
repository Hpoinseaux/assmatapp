import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function AjouterPhoto({ onAjoute, enfant }) {
  const [fichier, setFichier] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fichier) {
      setError("Veuillez sélectionner une photo");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const nomFichier = `${enfant}/${Date.now()}_${fichier.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from("photos")
        .upload(nomFichier, fichier);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(nomFichier);

      // Récupérer l'ID de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Impossible de récupérer l\'utilisateur');
      }

      // Insertion dans la table photos
      const { error: insertError } = await supabase
        .from(`photos_${enfant}`)
        .insert({
          url: publicUrl,
          date: new Date().toISOString().split("T")[0],
          enfant
        });

      if (insertError) throw insertError;

      setMessage("Photo ajoutée avec succès !");
      setFichier(null);
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout de la photo");
    } finally {
      setLoading(false);
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-4 max-w-md bg-blue-50 rounded-xl shadow-md p-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setFichier(e.target.files[0])}
              className="hidden"
              id="photo-upload"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !fichier}
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
            'Ajouter la photo'
          )}
        </button>

        {message && (
          <div className="message-success">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
