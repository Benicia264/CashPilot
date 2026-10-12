import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageAuth from '../components/PageAuth.jsx';

export default function ConnexionPage() {
  const { utilisateur, connecter } = useAuth();
  const lieu = useLocation();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  if (utilisateur) return <Navigate to={lieu.state?.depuis?.pathname || '/app'} replace />;

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await connecter(email, motDePasse);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <PageAuth
      titre="Content de vous revoir"
      sousTitre="Connectez-vous pour retrouver votre trésorerie."
      pied={
        <>
          Pas encore de compte ? <Link to="/inscription">Créer mon compte</Link>
        </>
      }
    >
      <form onSubmit={soumettre}>
        {erreur && (
          <div className="message-erreur" role="alert">
            {erreur}
          </div>
        )}

        <div className="champ">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="champ">
          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            type="password"
            autoComplete="current-password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
        </div>

        <button className="bouton bouton-principal bouton-bloc bouton-grand" disabled={envoi}>
          {envoi ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </PageAuth>
  );
}