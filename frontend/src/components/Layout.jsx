import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Ellipsis,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Receipt,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Marque from './Marque.jsx';

const LIENS = [
  { vers: '/app', libelle: 'Tableau de bord', court: 'Accueil', icone: LayoutDashboard, exact: true },
  { vers: '/app/factures', libelle: 'Factures', court: 'Factures', icone: FileText },
  { vers: '/app/clients', libelle: 'Clients', court: 'Clients', icone: Users },
  { vers: '/app/tresorerie', libelle: 'Trésorerie', court: 'Trésorerie', icone: Wallet },
  { vers: '/app/depenses', libelle: 'Dépenses', court: 'Dépenses', icone: Receipt },
  { vers: '/app/relances', libelle: 'Relances', court: 'Relances', icone: Bell },
  { vers: '/app/assistant', libelle: 'Assistant', court: 'Assistant', icone: MessageSquare },
];

const PARAMETRES = { vers: '/app/parametres', libelle: 'Paramètres', icone: Settings };

// Sur téléphone : 4 pages dans la barre du bas, le reste dans « Plus »
const PRINCIPAUX = LIENS.slice(0, 4);
const SECONDAIRES = [...LIENS.slice(4), PARAMETRES];

const ROLES = { proprietaire: 'Propriétaire', gestionnaire: 'Gestionnaire', lecteur: 'Lecteur' };

const classePastille = ({ isActive }) => (isActive ? 'pastille actif' : 'pastille');
const classeIcone = ({ isActive }) => (isActive ? 'haut-icone actif' : 'haut-icone');
const classeBasse = ({ isActive }) => (isActive ? 'actif' : '');

export default function Layout() {
  const { utilisateur, deconnecter } = useAuth();
  const navigate = useNavigate();
  const lieu = useLocation();
  const [plusOuvert, setPlusOuvert] = useState(false);

  useEffect(() => {
    setPlusOuvert(false);
  }, [lieu.pathname]);

  useEffect(() => {
    if (!plusOuvert) return undefined;
    const surTouche = (e) => e.key === 'Escape' && setPlusOuvert(false);
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, [plusOuvert]);

  const quitter = () => {
    deconnecter();
    navigate('/');
  };

  const initiales = utilisateur.nom
    .split(' ')
    .filter(Boolean)
    .map((mot) => mot[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const plusActif = SECONDAIRES.some((l) => lieu.pathname.startsWith(l.vers));

  return (
    <div className="app">
      <header className="haut">
        <div className="haut-contenu">
          <Link to="/app" className="haut-logo">
            <Marque taille={30} />
            CashPilot
          </Link>

          <nav className="pastilles" aria-label="Menu principal">
            {LIENS.map(({ vers, libelle, exact }) => (
              <NavLink key={vers} to={vers} end={exact} className={classePastille}>
                {libelle}
              </NavLink>
            ))}
          </nav>

          <span className="haut-entreprise">{utilisateur.entreprise.nom}</span>

          <div className="haut-droite">
            <NavLink to="/app/relances" className={classeIcone} aria-label="Relances" title="Relances">
              <Bell size={18} strokeWidth={1.8} />
            </NavLink>
            <NavLink
              to={PARAMETRES.vers}
              className={classeIcone}
              aria-label="Paramètres"
              title="Paramètres"
            >
              <Settings size={18} strokeWidth={1.8} />
            </NavLink>
            <span
              className="haut-avatar"
              title={`${utilisateur.nom}, ${ROLES[utilisateur.role]}, ${utilisateur.entreprise.nom}`}
            >
              {initiales}
            </span>
            <button
              type="button"
              className="haut-icone"
              onClick={quitter}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <main className="contenu">
        <div key={lieu.pathname} className="page">
          <Outlet />
        </div>
      </main>

      <nav className="nav-basse" aria-label="Navigation mobile">
        {PRINCIPAUX.map(({ vers, court, icone: Icone, exact }) => (
          <NavLink key={vers} to={vers} end={exact} className={classeBasse}>
            <Icone size={21} strokeWidth={1.8} />
            {court}
          </NavLink>
        ))}
        <button
          type="button"
          className={plusActif || plusOuvert ? 'actif' : ''}
          onClick={() => setPlusOuvert((ouvert) => !ouvert)}
          aria-expanded={plusOuvert}
        >
          <Ellipsis size={21} strokeWidth={1.8} />
          Plus
        </button>
      </nav>

      {plusOuvert && (
        <>
          <div className="feuille-fond" onClick={() => setPlusOuvert(false)} />
          <div className="feuille" role="dialog" aria-label="Autres pages">
            <div className="feuille-poignee" />
            {SECONDAIRES.map(({ vers, libelle, icone: Icone }) => (
              <Link key={vers} to={vers}>
                <Icone size={20} strokeWidth={1.8} />
                {libelle}
              </Link>
            ))}
            <button type="button" onClick={quitter}>
              <LogOut size={20} strokeWidth={1.8} />
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
}