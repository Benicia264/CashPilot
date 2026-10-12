import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Marque from './Marque.jsx';

const LIENS = [
  { vers: '/app', libelle: 'Tableau de bord', exact: true },
  { vers: '/app/clients', libelle: 'Clients' },
  { vers: '/app/factures', libelle: 'Factures' },
  { vers: '/app/tresorerie', libelle: 'Trésorerie' },
  { vers: '/app/relances', libelle: 'Relances' },
  { vers: '/app/assistant', libelle: 'Assistant' },
];

const ROLES = {
  proprietaire: 'Propriétaire',
  gestionnaire: 'Gestionnaire',
  lecteur: 'Lecteur',
};

const classe = ({ isActive }) => (isActive ? 'actif' : '');

export default function Layout() {
  const { utilisateur, deconnecter, estProprietaire } = useAuth();
  const navigate = useNavigate();

  const quitter = () => {
    deconnecter();
    navigate('/');
  };

  return (
    <div className="app">
      <aside className="barre">
        <Link to="/app" className="logo">
          <Marque taille={30} />
          CashPilot
        </Link>

        <nav className="menu" aria-label="Menu principal">
          {LIENS.map((lien) => (
            <NavLink key={lien.vers} to={lien.vers} end={lien.exact} className={classe}>
              {lien.libelle}
            </NavLink>
          ))}
          {estProprietaire && (
            <NavLink to="/app/equipe" className={classe}>
              Équipe
            </NavLink>
          )}
        </nav>

        <div className="barre-bas">
          <div className="barre-entreprise">
            <strong>{utilisateur.entreprise.nom}</strong>
            <span>
              {utilisateur.nom}, {ROLES[utilisateur.role]}
            </span>
          </div>
          <button className="bouton bouton-discret bouton-sur-fonce" onClick={quitter}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="contenu">
        <Outlet />
      </main>
    </div>
  );
}