import { useAuth } from '../contexts/AuthProvider';
import  useProfile  from '../hooks/useProfile';
import { Navigate } from 'react-router-dom';

export default function AuthWrapper() {
  const { session } = useAuth();
  const { profile, loading, error } = useProfile();

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session || !profile) {
    return <Navigate to="/" replace />;
  }

  // Redirection selon rôle
  switch (profile.role) {
    case "nounou":
      return <Navigate to="/nounou" replace />;
    case "parent":
      return <Navigate to={`/parent/${profile.enfant}`} replace />;
    default:
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Rôle non reconnu
        </div>
      );
  }
}
