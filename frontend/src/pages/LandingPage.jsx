import { Link } from 'react-router-dom'; 
import { KeyRound, Lock, Users } from 'lucide-react'; 
import Marque from '../components/Marque.jsx'; 
import ApercuProduit from '../components/ApercuProduit.jsx'; 
import '../styles/landing.css'; 

export default function LandingPage() { 
  return ( 
    <div className="landing"> 
      {/* ---------- En-tête / Nav 100% Claire & Visible ---------- */}
      <header className="l-entete"> 
        <div className="l-conteneur l-entete-contenu"> 
          <Link to="/" className="l-logo"> 
            <Marque taille={28} /> 
            <span className="l-logo-texte">CashPilot</span> 
          </Link> 

          <nav className="l-nav" aria-label="Sections de la page"> 
            <a href="#fonctions">Fonctionnalités</a> 
            <a href="#etapes">Comment ça marche</a> 
            <a href="#donnees">Vos données</a> 
          </nav> 

          <div className="l-actions"> 
            <Link className="l-lien" to="/connexion"> 
              Se connecter 
            </Link> 
            <Link className="bouton bouton-accent" to="/inscription"> 
              Créer mon compte 
            </Link> 
          </div> 
        </div> 
      </header> 

      <main> 
        {/* ---------- Hero Section ---------- */}
        <section className="l-hero"> 
          <div className="l-conteneur"> 
            <div className="l-hero-texte"> 
              <h1>Sachez dès aujourd'hui si votre caisse tiendra le mois prochain.</h1> 
              <p className="l-chapeau"> 
                CashPilot suit vos factures, relance les clients qui tardent à payer et prévoit 
                votre trésorerie à 30, 60 et 90 jours. Conçu pour les petites entreprises. 
              </p> 
              <div className="l-actions-hero"> 
                <Link className="bouton bouton-accent bouton-grand" to="/inscription"> 
                  Créer mon compte 
                </Link> 
                <Link className="bouton bouton-secondaire bouton-grand" to="/connexion"> 
                  Se connecter 
                </Link> 
              </div> 
              <p className="l-note">Montants en FCFA. Relances par email et par WhatsApp.</p> 
            </div> 

            <div className="l-hero-apercu"> 
              <ApercuProduit /> 
            </div> 
          </div> 
        </section> 

        {/* ---------- Bento Grid Fonctionnalités ---------- */}
        <section id="fonctions" className="l-fonctions"> 
          <div className="l-conteneur"> 
            <div className="l-intro"> 
              <h2>Tout pour piloter votre trésorerie, rien de superflu.</h2> 
              <p> 
                Une entreprise qui vend bien peut quand même manquer d'argent : les factures 
                arrivent en retard, les charges, elles, tombent à date fixe. CashPilot rassemble 
                tout au même endroit et vous prévient à temps. 
              </p> 
            </div> 

            <div className="l-bento"> 
              <article className="l-tuile l-tuile-large"> 
                <div> 
                  <h3>Sachez qui vous doit, et depuis quand</h3> 
                  <p> 
                    Chaque facture a un statut calculé automatiquement : en attente, en retard, 
                    payée ou annulée. 
                  </p> 
                </div> 
                <div className="l-tuile-visuel"> 
                  <div className="mv-ligne"> 
                    <span className="mv-initiale">B</span> 
                    <div> 
                      <span className="mv-nom">Boulangerie Ngoma</span> 
                      <span className="mv-sous">2 factures</span> 
                    </div> 
                    <div className="mv-droite"> 
                      <span className="mv-montant">1 000 000 FCFA</span> 
                      <span className="badge badge-retard">100 jours de retard</span> 
                    </div> 
                  </div> 
                  <div className="mv-ligne"> 
                    <span className="mv-initiale">C</span> 
                    <div> 
                      <span className="mv-nom">Cabinet Okemba</span> 
                      <span className="mv-sous">2 factures</span> 
                    </div> 
                    <div className="mv-droite"> 
                      <span className="mv-montant">750 000 FCFA</span> 
                      <span className="badge badge-retard">40 jours de retard</span> 
                    </div> 
                  </div> 
                </div> 
              </article> 

              <article className="l-tuile"> 
                <div> 
                  <h3>Relances prêtes en un clic</h3> 
                  <p> 
                    Par WhatsApp, le message est déjà rédigé avec le montant exact et le retard. 
                  </p> 
                </div> 
                <div className="l-tuile-visuel"> 
                  <div className="mv-message"> 
                    <p className="mv-message-titre">Prêt à envoyer à Cabinet Okemba</p> 
                    <p className="mv-message-texte"> 
                      Bonjour Cabinet Okemba, la facture T-003 de 750 000 FCFA est impayée depuis 40 jours. 
                    </p> 
                    <span className="mv-message-bouton">Ouvrir dans WhatsApp</span> 
                  </div> 
                </div> 
              </article> 
            </div> 
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
                <p>Statuts, relances et prévisions se mettent à jour pour vous.</p> 
              </li> 
            </ol> 
          </div> 
        </section> 

        {/* ---------- Sécurité ---------- */}
        <section id="donnees" className="l-donnees"> 
          <div className="l-conteneur"> 
            <h2>Vos chiffres restent les vôtres.</h2> 
            <div className="l-donnees-liste"> 
              <div> 
                <span className="l-donnees-icone"> 
                  <Lock size={20} /> 
                </span> 
                <h3>Séparées par entreprise</h3> 
                <p>Chaque entreprise a ses propres données, invisibles pour les autres.</p> 
              </div> 
              <div> 
                <span className="l-donnees-icone"> 
                  <Users size={20} /> 
                </span> 
                <h3>Trois rôles</h3> 
                <p>Propriétaire, gestionnaire, lecteur. Le lecteur consulte sans modifier.</p> 
              </div> 
              <div> 
                <span className="l-donnees-icone"> 
                  <KeyRound size={20} /> 
                </span> 
                <h3>Sécurisé</h3> 
                <p>Vos accès et données de trésorerie sont chiffrés.</p> 
              </div> 
            </div> 
          </div> 
        </section> 

        {/* ---------- CTA Final ---------- */}
        <section className="l-final"> 
          <div className="l-conteneur"> 
            <h2>Commencez par ajouter votre première facture.</h2> 
            <p>Créez votre compte : CashPilot s'occupe ensuite du suivi.</p> 
            <div className="l-actions-hero"> 
              <Link className="bouton bouton-accent bouton-grand" to="/inscription"> 
                Créer mon compte 
              </Link> 
            </div> 
          </div> 
        </section> 
      </main> 

      <footer className="l-pied"> 
        <div className="l-conteneur l-pied-contenu"> 
          <span>© {new Date().getFullYear()} CashPilot</span> 
          <span className="l-pied-liens"> 
            <Link to="/connexion">Se connecter</Link> 
            <Link to="/inscription">Créer un compte</Link> 
          </span> 
        </div> 
      </footer> 
    </div> 
  ); 
}