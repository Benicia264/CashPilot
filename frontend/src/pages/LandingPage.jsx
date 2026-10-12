import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Marque from '../components/Marque.jsx';
import ApercuTresorerie from '../components/ApercuTresorerie.jsx';
import '../styles/landing.css';

function BoutonsAcces({ grand = false, surFonce = false }) {
  const { utilisateur } = useAuth();
  const taille = grand ? ' bouton-grand' : '';

  if (utilisateur) {
    return (
      <Link className={`bouton ${surFonce ? 'bouton-or' : 'bouton-principal'}${taille}`} to="/app">
        Ouvrir mon tableau de bord
      </Link>
    );
  }
  return (
    <>
      <Link
        className={`bouton ${surFonce ? 'bouton-or' : 'bouton-principal'}${taille}`}
        to="/inscription"
      >
        Créer mon compte
      </Link>
      <Link
        className={`bouton ${surFonce ? 'bouton-contour-clair' : 'bouton-contour'}${taille}`}
        to="/connexion"
      >
        Se connecter
      </Link>
    </>
  );
}

export default function LandingPage() {
  const { utilisateur } = useAuth();

  return (
    <div className="landing">
      <header className="l-entete">
        <div className="l-conteneur l-entete-contenu">
          <Link to="/" className="l-logo">
            <Marque />
            <span className="l-logo-texte">CashPilot</span>
          </Link>

          <nav className="l-nav" aria-label="Sections de la page">
            <a href="#fonctions">Fonctionnalités</a>
            <a href="#etapes">Comment ça marche</a>
            <a href="#donnees">Vos données</a>
          </nav>

          <div className="l-actions">
            {utilisateur ? (
              <Link className="bouton bouton-principal" to="/app">
                Mon tableau de bord
              </Link>
            ) : (
              <>
                <Link className="l-lien-connexion" to="/connexion">
                  Se connecter
                </Link>
                <Link className="bouton bouton-principal" to="/inscription">
                  Créer mon compte
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* ---------- En-tête de page ---------- */}
        <section className="l-hero">
          <div className="l-conteneur l-hero-grille">
            <div>
              <h1>Sachez dès aujourd'hui si votre caisse tiendra le mois prochain.</h1>
              <p className="l-chapeau">
                CashPilot suit vos factures, relance les clients qui tardent à payer et prévoit
                votre trésorerie à 30, 60 et 90 jours. Conçu pour les petites entreprises.
              </p>
              <div className="l-hero-actions">
                <BoutonsAcces grand />
              </div>
              <p className="l-note">Montants en FCFA. Relances par email et par WhatsApp.</p>
            </div>
            <ApercuTresorerie />
          </div>
        </section>

        {/* ---------- Le problème ---------- */}
        <section className="l-probleme">
          <div className="l-conteneur l-deux-colonnes">
            <h2>Une entreprise qui vend bien peut quand même manquer d'argent.</h2>
            <div className="l-texte-long">
              <p>
                Les factures sont émises, mais l'argent arrive en retard. En attendant, il faut
                payer les salaires, le loyer et les fournisseurs.
              </p>
              <p>
                Sans vue claire sur qui doit quoi, on relance trop tard, et on découvre le trou
                de trésorerie quand il est déjà là.
              </p>
              <p>
                CashPilot rassemble ces informations au même endroit et vous prévient à temps.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Fonctionnalités ---------- */}
        <section id="fonctions" className="l-fonctions">
          <div className="l-conteneur">
            <article className="l-fonction">
              <div>
                <h3>Voyez en un coup d'œil qui vous doit de l'argent</h3>
                <p>
                  Chaque facture a un statut calculé automatiquement : en attente, en retard,
                  payée ou annulée. Les paiements partiels sont pris en compte.
                </p>
                <p>Un paiement ne peut jamais dépasser ce qu'il reste à payer.</p>
              </div>
              <div className="l-visuel" aria-hidden="true">
                <div className="mini-liste">
                  <div className="mini-ligne">
                    <span className="nom">Boulangerie Ngoma</span>
                    <span className="montant">1 000 000</span>
                    <span className="detail">2 factures</span>
                    <span className="badge badge-danger">100 jours de retard</span>
                  </div>
                  <div className="mini-ligne">
                    <span className="nom">Cabinet Okemba</span>
                    <span className="montant">750 000</span>
                    <span className="detail">2 factures</span>
                    <span className="badge badge-danger">40 jours de retard</span>
                  </div>
                  <div className="mini-ligne">
                    <span className="nom">Transports Itoua</span>
                    <span className="montant">400 000</span>
                    <span className="detail">1 facture</span>
                    <span className="badge badge-attente">À payer dans 45 jours</span>
                  </div>
                </div>
                <p className="l-legende">Montants en FCFA, données d'exemple.</p>
              </div>
            </article>

            <article className="l-fonction">
              <div>
                <h3>Relancez vos clients sans y penser</h3>
                <p>
                  Définissez vos règles une fois : un rappel à 3 jours de retard, un autre à 10,
                  un dernier à 20. Chaque jour, CashPilot prépare le bon message pour chaque
                  facture en retard, sans jamais envoyer deux fois le même.
                </p>
                <p>
                  Par email, l'envoi est automatique. Par WhatsApp, le message est prêt : vous
                  l'envoyez en un geste, depuis votre propre numéro.
                </p>
              </div>
              <div className="l-visuel" aria-hidden="true">
                <div className="mini-regles">
                  <div className="regle">
                    <span className="jour">J+3</span>
                    <span>Petit rappel courtois</span>
                  </div>
                  <div className="regle">
                    <span className="jour">J+10</span>
                    <span>Rappel plus ferme</span>
                  </div>
                  <div className="regle">
                    <span className="jour">J+20</span>
                    <span>Demande de règlement</span>
                  </div>
                </div>
                <div className="message-whatsapp message-seul">
                  <p className="message-titre">Prêt à envoyer à Cabinet Okemba</p>
                  <p className="message-texte">
                    Bonjour Cabinet Okemba, la facture T-003 de 500 000 FCFA est impayée depuis 40
                    jours. Merci de nous contacter aujourd'hui pour convenir d'un règlement.
                  </p>
                  <span className="message-bouton">Ouvrir dans WhatsApp</span>
                </div>
              </div>
            </article>

            <article className="l-fonction">
              <div>
                <h3>Anticipez les creux de trésorerie</h3>
                <p>
                  Ajoutez vos charges régulières : loyer, salaires, abonnements. CashPilot les
                  combine avec les factures à encaisser et vous montre votre solde à 30, 60 et 90
                  jours.
                </p>
                <p>
                  Choisissez le scénario prudent, qui ignore les factures en retard, ou le
                  scénario probable, qui suppose qu'elles seront payées sous 15 jours.
                </p>
              </div>
              <div className="l-visuel" aria-hidden="true">
                <div className="mini-scenarios">
                  <span className="actif">Prudent</span>
                  <span>Probable</span>
                </div>
                <div className="mini-horizons">
                  <div className="horizon">
                    <span>Dans 30 jours</span>
                    <strong>200 000</strong>
                  </div>
                  <div className="horizon">
                    <span>Dans 60 jours</span>
                    <strong>50 000</strong>
                  </div>
                  <div className="horizon negatif">
                    <span>Dans 90 jours</span>
                    <strong>−500 000</strong>
                  </div>
                </div>
                <p className="mini-alerte">
                  Attention : découvert prévu le 28 décembre, dans 77 jours.
                </p>
                <p className="l-legende">Montants en FCFA, données d'exemple.</p>
              </div>
            </article>

            <article className="l-fonction">
              <div>
                <h3>Posez la question, obtenez la réponse</h3>
                <p>
                  « Qui me doit le plus ? », « Quelles factures sont en retard ? », « Combien
                  dois-je encaisser ce mois-ci ? » : l'assistant répond avec vos chiffres.
                </p>
                <p>Pas de formule à écrire, pas de tableau à construire.</p>
              </div>
              <div className="l-visuel" aria-hidden="true">
                <div className="mini-chat">
                  <div className="bulle bulle-question">Qui me doit le plus d'argent ?</div>
                  <div className="bulle bulle-reponse">
                    Clients qui vous doivent le plus :
                    <ol>
                      <li>Boulangerie Ngoma : 1 000 000 FCFA</li>
                      <li>Cabinet Okemba : 750 000 FCFA</li>
                      <li>Transports Itoua : 400 000 FCFA</li>
                    </ol>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* ---------- Étapes ---------- */}
        <section id="etapes" className="l-etapes">
          <div className="l-conteneur">
            <h2>Prêt en trois étapes</h2>
            <ol className="l-etapes-liste">
              <li>
                <h3>Créez votre compte</h3>
                <p>Renseignez votre entreprise, puis ajoutez vos clients.</p>
              </li>
              <li>
                <h3>Enregistrez vos factures</h3>
                <p>Saisissez vos factures et vos paiements au fil de l'eau.</p>
              </li>
              <li>
                <h3>Laissez CashPilot suivre</h3>
                <p>Les statuts, les relances et les prévisions se mettent à jour pour vous.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ---------- Données ---------- */}
        <section id="donnees" className="l-donnees">
          <div className="l-conteneur">
            <h2>Vos chiffres restent les vôtres.</h2>
            <div className="l-donnees-liste">
              <div>
                <h3>Séparées par entreprise</h3>
                <p>Chaque entreprise a ses propres données, invisibles pour les autres.</p>
              </div>
              <div>
                <h3>Trois rôles</h3>
                <p>
                  Propriétaire, gestionnaire, lecteur. Le lecteur consulte sans rien pouvoir
                  modifier.
                </p>
              </div>
              <div>
                <h3>Mots de passe protégés</h3>
                <p>Les mots de passe ne sont jamais conservés en clair.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Appel final ---------- */}
        <section className="l-final">
          <div className="l-conteneur">
            <h2>Commencez par ajouter votre première facture.</h2>
            <p>Créez votre compte : CashPilot s'occupe ensuite du suivi.</p>
            <div className="l-hero-actions">
              <BoutonsAcces grand surFonce />
            </div>
          </div>
        </section>
      </main>

      <footer className="l-pied">
        <div className="l-conteneur l-pied-contenu">
          <span>© {new Date().getFullYear()} CashPilot</span>
          <span>Factures, relances et trésorerie pour petites entreprises.</span>
        </div>
      </footer>
    </div>
  );
}