import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageAuth from '../components/PageAuth.jsx';

export default function InscriptionPage() {
  const { inscrire } = useAuth();
  const naviguer = useNavigate();
  const [formulaire, setFormulaire] = useState({
    entrepriseNom: '',
    nom: '',
    email: '',
    motDePasse: '',
  });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const modifier = (champ) => (e) =>
    setFormulaire((precedent) => ({ ...precedent, [champ]: e.target.value }));

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      await inscrire(formulaire);
      naviguer('/app');
    } catch (err) {
      setErreur(err.message || "Impossible de créer le compte.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <PageAuth
      titre="Créez votre compte CashPilot"
      sousTitre="Pilotez votre trésorerie et anticipez vos découverts en toute sérénité."
      pied={
        <>
          Déjà un compte ? <Link to="/connexion">Se connecter</Link>
        </>
      }
    >
      <form onSubmit={soumettre} className="formulaire-auth-moderne">
        {erreur && (
          <div className="message-erreur" role="alert">
            {erreur}
          </div>
        )}

        <div className="champ">
          <label htmlFor="entrepriseNom">Nom de l'entreprise</label>
          <input
            id="entrepriseNom"
            placeholder="Ex : Boulangerie Ngoma"
            required
            maxLength={150}
            value={formulaire.entrepriseNom}
            onChange={modifier('entrepriseNom')}
          />
        </div>

        <div className="champ">
          <label htmlFor="nom">Votre nom complet</label>
          <input
            id="nom"
            placeholder="Ex : Jean-Claude Itoua"
            autoComplete="name"
            required
            maxLength={150}
            value={formulaire.nom}
            onChange={modifier('nom')}
          />
        </div>

        <div className="champ">
          <label htmlFor="email">Adresse email professionnelle</label>
          <input
            id="email"
            type="email"
            placeholder="vous@entreprise.com"
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
            placeholder="••••••••••••"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={72}
            value={formulaire.motDePasse}
            onChange={modifier('motDePasse')}
          />
          <span className="aide">Minimum 8 caractères sécurisés.</span>
        </div>

        <button className="bouton bouton-principal bouton-bloc bouton-grand" disabled={envoi}>
          {envoi ? 'Création en cours…' : 'Créer mon compte'}
        </button>
      </form>
    </PageAuth>
  );
}