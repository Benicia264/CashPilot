import React from 'react';

export default function ApercuProduit() {
  return (
    <div className="fenetre">
      <div className="ap-carte-main">
        <div className="ap-entete-simple">
          <span className="ap-titre-leger">Trésorerie à 90 jours</span>
          <span className="ap-tag-exemple">Exemple</span>
        </div>

        {/* Badge d'alerte rouge flottant */}
        <div className="ap-badge-alerte-flottant">
          Découvert prévu le 28 décembre
        </div>

        {/* --- GRAPHE EN ESCALIER SVG (Pente depuis le haut) --- */}
        <div className="ap-graphique-wrapper">
          <svg className="ap-graphique" viewBox="0 0 500 200" fill="none">
            {/* Grille de fond */}
            <line x1="0" y1="40" x2="500" y2="40" className="ap-grille" />
            <line x1="0" y1="90" x2="500" y2="90" className="ap-grille" />
            <line x1="0" y1="140" x2="500" y2="140" className="ap-zero-line" />

            {/* Zone rouge ombragée sous la fin de la ligne en découvert */}
            <path
              d="M 380 140 L 415 140 L 415 165 L 450 165 L 450 185 L 490 185 L 490 140 Z"
              className="ap-zone-danger"
            />

            {/* Ligne en escalier partant du HAUT vers le BAS */}
            <path
              d="M 10 40 L 60 40 L 60 70 L 120 70 L 120 50 L 180 50 L 180 80 L 250 80 L 250 60 L 310 60 L 310 100 L 380 100 L 380 140 L 415 140 L 415 165 L 450 165 L 450 185 L 490 185"
              className="ap-ligne-escalier"
            />

            {/* Repère rouge du découvert final */}
            <g className="ap-marqueur-groupe">
              <line x1="450" y1="0" x2="450" y2="200" className="ap-ligne-repere" />
              <rect x="444" y="159" width="12" height="12" rx="3" className="ap-point-rouge" />
            </g>

            {/* Repères sous l'axe X */}
            <text x="310" y="195" className="ap-axe-texte">60 j</text>
            <text x="445" y="195" className="ap-axe-texte">90 j</text>
          </svg>
        </div>

        {/* Inscription Solde Négatif */}
        <div className="ap-info-solde">
          <span className="ap-info-libelle">Dans 90 jours</span>
          <strong className="ap-info-montant">-500 000 FCFA</strong>
        </div>

        {/* Bulle de relance WhatsApp */}
        <div className="ap-carte-relance">
          <p className="ap-relance-titre">Relance prête pour Boulangerie Ngoma</p>
          <p className="ap-relance-corps">
            Bonjour Boulangerie Ngoma, la facture T-001 de 800 000 FCFA est impayée depuis 100 jours. Merci de nous contacter aujourd'hui.
          </p>
          <button type="button" className="ap-btn-wa">
            Ouvrir dans WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}