import { Link } from 'react-router-dom';
import Marque from './Marque.jsx';
import '../styles/auth.css';

export default function PageAuth({ titre, sousTitre, children, pied }) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link to="/" className="auth-logo">
          <Marque taille={28} />
          <span>CashPilot</span>
        </Link>
      </header>

      <main className="auth-conteneur">
        <div className="auth-carte">
          <div className="auth-entete">
            <h2>{titre}</h2>
            {sousTitre && <p className="auth-soustitre">{sousTitre}</p>}
          </div>

          <div className="auth-corps">{children}</div>

          {pied && <div className="auth-pied">{pied}</div>}
        </div>

        <div className="auth-retour">
          <Link to="/">← Retour à l'accueil</Link>
        </div>
      </main>
    </div>
  );
}