import { Link } from 'react-router-dom';
import Marque from './Marque.jsx';

export default function PageAuth({ titre, sousTitre, pied, children }) {
  return (
    <div className="auth">
      <aside className="auth-panneau">
        <Link to="/" className="auth-logo">
          <Marque taille={34} />
          CashPilot
        </Link>
        <div>
          <h2>Gardez un œil sur l'argent qui entre et qui sort.</h2>
          <p>Factures, relances et prévisions de trésorerie, au même endroit.</p>
        </div>
        <p className="auth-bas">Vos données sont séparées de celles des autres entreprises.</p>
      </aside>

      <main className="auth-formulaire">
        <div className="auth-boite">
          <Link to="/" className="auth-logo-mobile">
            <Marque taille={30} />
            CashPilot
          </Link>
          <h1>{titre}</h1>
          <p className="muted">{sousTitre}</p>
          {children}
          <p className="lien-bas">{pied}</p>
          <Link to="/" className="auth-retour">
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}