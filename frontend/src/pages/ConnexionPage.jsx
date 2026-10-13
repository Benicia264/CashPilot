import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageAuth from '../components/PageAuth.jsx';

export default function ConnexionPage() {
  const { connecter } = useAuth();
  const naviguer = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await connecter(email, motDePasse);
      naviguer('/app');
    } catch (err) {
      setErreur(err.message || "Identifiants incorrects.");
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
            placeholder="vous@entreprise.com"
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
            placeholder="••••••••••••"
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