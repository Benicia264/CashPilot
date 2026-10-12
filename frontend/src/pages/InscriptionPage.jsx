import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageAuth from '../components/PageAuth.jsx';

export default function InscriptionPage() {
  const { utilisateur, inscrire } = useAuth();
  const [formulaire, setFormulaire] = useState({
    entrepriseNom: '',
    nom: '',
    email: '',
    motDePasse: '',
  });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  if (utilisateur) return <Navigate to="/app" replace />;

  const modifier = (champ) => (e) =>
    setFormulaire((precedent) => ({ ...precedent, [champ]: e.target.value }));

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await inscrire(formulaire);
    } catch (err) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <PageAuth
      titre="Créez votre compte"
      sousTitre="Vous serez le propriétaire de votre entreprise sur CashPilot."
      pied={
        <>
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
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
          <label htmlFor="entrepriseNom">Nom de l'entreprise</label>
          <input
            id="entrepriseNom"
            required
            maxLength={150}
            value={formulaire.entrepriseNom}
            onChange={modifier('entrepriseNom')}
          />
        </div>

        <div className="champ">
          <label htmlFor="nom">Votre nom</label>
          <input
            id="nom"
            autoComplete="name"
            required
            maxLength={150}
            value={formulaire.nom}
            onChange={modifier('nom')}
          />
        </div>

        <div className="champ">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={formulaire.email}
            onChange={modifier('email')}
          />
        </div>

        <div className="champ">
          <label htmlFor="motDePasse">Mot de passe</label>
          <input
            id="motDePasse"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={formulaire.motDePasse}
            onChange={modifier('motDePasse')}
          />
          <span className="aide">Entre 8 et 72 caractères.</span>
        </div>

        <button className="bouton bouton-principal bouton-bloc bouton-grand" disabled={envoi}>
          {envoi ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </PageAuth>
  );
}