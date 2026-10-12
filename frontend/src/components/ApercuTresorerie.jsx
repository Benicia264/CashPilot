export default function ApercuTresorerie() {
  return (
    <div className="apercu" aria-hidden="true">
      <div className="apercu-fenetre">
        <div className="apercu-titre">
          <span>Trésorerie à 90 jours</span>
          <span className="pastille-exemple">Exemple</span>
        </div>

        <svg viewBox="0 0 480 220" className="apercu-graphique">
          {[20, 160, 300, 440].map((x) => (
            <line key={x} x1={x} x2={x} y1="14" y2="196" className="grille" />
          ))}
          <path d="M426 150 V184 H462 V150 Z" className="zone-rouge" />
          <line x1="20" x2="462" y1="150" y2="150" className="ligne-zero" />
          <path
            d="M20 70 H100 V96 H170 V64 H240 V100 H300 V56 H350 V88 H392 V128 H426 V184 H462"
            pathLength="1"
            className="courbe"
          />
          <g className="alerte-point">
            <line x1="426" y1="48" x2="426" y2="144" className="trait-alerte" />
            <rect x="252" y="14" width="204" height="34" rx="9" className="bulle-alerte" />
            <text x="266" y="35" className="texte-alerte">
              Découvert prévu le 28 décembre
            </text>
            <circle cx="426" cy="150" r="6" className="point" />
          </g>
          <text x="20" y="214" className="axe">Aujourd'hui</text>
          <text x="160" y="214" className="axe" textAnchor="middle">30 j</text>
          <text x="300" y="214" className="axe" textAnchor="middle">60 j</text>
          <text x="440" y="214" className="axe" textAnchor="middle">90 j</text>
        </svg>

        <div className="apercu-chiffres">
          <div>
            <span className="petit">Dans 30 jours</span>
            <strong>200 000 <small>FCFA</small></strong>
          </div>
          <div>
            <span className="petit">Dans 60 jours</span>
            <strong>50 000 <small>FCFA</small></strong>
          </div>
          <div className="negatif">
            <span className="petit">Dans 90 jours</span>
            <strong>−500 000 <small>FCFA</small></strong>
          </div>
        </div>
      </div>

      <div className="message-whatsapp">
        <p className="message-titre">Relance prête pour Boulangerie Ngoma</p>
        <p className="message-texte">
          Bonjour Boulangerie Ngoma, la facture T-001 de 800 000 FCFA est impayée depuis
          100 jours. Merci de nous contacter aujourd'hui pour convenir d'un règlement.
        </p>
        <span className="message-bouton">Ouvrir dans WhatsApp</span>
      </div>
    </div>
  );
}