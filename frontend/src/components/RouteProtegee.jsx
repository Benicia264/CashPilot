import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Entoure les pages réservées aux personnes connectées.
// Option : roles={['proprietaire']} pour limiter à certains rôles.
export default function RouteProtegee({ roles }) {
  const { utilisateur, chargement } = useAuth();
  const lieu = useLocation();

  if (chargement) return <p className="chargement">Chargement…</p>;
  if (!utilisateur) return <Navigate to="/connexion" replace state={{ depuis: lieu }} />;
  if (roles && !roles.includes(utilisateur.role)) return <Navigate to="/app" replace />;
  return <Outlet />;
}