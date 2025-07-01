import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Connexion directe avec supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Résultat de la connexion:', { data, error });
      
      if (error) throw error;
      
      if (data && data.session) {
        console.log('Utilisateur connecté:', data.session.user);
        
        // Récupérer le profil pour déterminer le rôle
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, enfant')
          .eq('user_id', data.session.user.id)
          .single();

        console.log('Résultat de la requête profil:', { profile, profileError });

        if (profile) {
          console.log('Profil trouvé:', profile);
          
          // Stocker l'enfant dans le localStorage
          if (profile.enfant) {
            localStorage.setItem('enfant', profile.enfant);
          }
          
          // Redirection selon le rôle
          if (profile.role === 'nounou') {
            navigate('/nounou');
          } else if (profile.role === 'parent') {
            navigate(`/parent/${profile.enfant}`);
          } else {
            setError('Rôle non reconnu');
          }
        } else {
          setError('Profil non trouvé');
        }
      } else {
        setError('Utilisateur non trouvé');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold text-center">Connexion</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          placeholder="Mot de passe"
          className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading || !email || !password}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Connexion...
          </div>
        ) : (
          'Se connecter'
        )}
      </button>
    </form>
  );
}
