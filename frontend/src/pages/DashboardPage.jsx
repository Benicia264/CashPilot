import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { utilisateur } = useAuth();

  return (
    <div>
      <h1>Bonjour {utilisateur.nom} 👋</h1>
      <p className="muted">
        Entreprise : {utilisateur.entreprise.nom} · Rôle : {utilisateur.role}
      </p>
      <p>Votre tableau de bord arrive à l'étape suivante.</p>
    </div>
  );
}