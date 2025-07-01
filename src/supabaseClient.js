import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Veuillez définir les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Configuration client
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  },
};

// Création du client
export const supabase = createClient(supabaseUrl, supabaseKey, options);

// Ajout de méthodes utilitaires
supabase.withErrorHandling = async (promise) => {
  try {
    const { data, error } = await promise;
    if (error) throw error;
    return data;
  } catch (err) {
    throw new Error(err.message || 'Erreur lors de la communication avec Supabase');
  }
};

export default supabase;
