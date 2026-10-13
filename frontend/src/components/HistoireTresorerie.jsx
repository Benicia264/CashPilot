import { useEffect, useRef, useState } from 'react';
import '../styles/histoire.css';

const JOURS = 90;
const ENTETE = 66; // hauteur de l'en-tête collant de la landing
const X0 = 36;
const X1 = 584;
const Y_ZERO = 190;
const PX_PAR_FCFA = 0.00014;
const SOLDE_INITIAL = 500000;
const DEPART = new Date(2026, 9, 12);
const RELANCES = { jour: 34, montant: 600000 };

// Phases de l'animation, en proportion du défilement
const P_FIN_A = 0.62;
const P_DEBUT_B = 0.74;
const P_FIN_B = 0.92;

const EVENEMENTS = [
  { jour: 12, delta: -250000, libelle: 'Salaires' },
  { jour: 22, delta: 250000, libelle: 'Facture payée' },
  { jour: 28, delta: -300000, libelle: 'Loyer' },
  { jour: 42, delta: 250000, libelle: 'Facture encaissée' },
  { jour: 55, delta: -250000, libelle: 'Salaires' },
  { jour: 58, delta: -150000, libelle: 'Fournisseurs' },
  { jour: 77, delta: -250000, libelle: 'Salaires' },
  { jour: 86, delta: -300000, libelle: 'Loyer' },
];

const ETAPES = [
  {
    titre: "Aujourd'hui, 500 000 FCFA en caisse",
    texte: 'Vous ajoutez vos charges régulières et vos factures. CashPilot fait le reste.',
  },
  {
    titre: 'Chaque salaire, chaque loyer, chaque facture',
    texte:
      'Tout est placé jour par jour sur le calendrier. Vous voyez le solde évoluer avant que cela arrive.',
  },
  {
    titre: 'Le 28 décembre, la caisse passe sous zéro',
    texte: 'Vous le savez 77 jours à l\'avance, pas le matin où un paiement est refusé.',
  },
  {
    titre: 'Deux relances plus tard, la courbe se redresse',
    texte:
      'Les factures en retard sont payées : 600 000 FCFA reviennent en caisse et le découvert est évité.',
  },
];

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const arrondi = (n) => Math.round(n * 10) / 10;
const x = (jour) => arrondi(X0 + (jour / JOURS) * (X1 - X0));
const y = (solde) => arrondi(Y_ZERO - solde * PX_PAR_FCFA);
const fmt = new Intl.NumberFormat('fr-FR');

const soldeA = (jour) =>
  EVENEMENTS.reduce((s, e) => (e.jour <= jour ? s + e.delta : s), SOLDE_INITIAL);
const soldeB = (jour) => soldeA(jour) + (jour >= RELANCES.jour ? RELANCES.montant : 0);

const dateDuJour = (jour) => {
  const d = new Date(DEPART);
  d.setDate(d.getDate() + Math.round(jour));
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
};

// Courbe en marches d'escalier : le solde change à chaque événement
const CHEMIN_A = (() => {
  let d = `M${x(0)} ${y(SOLDE_INITIAL)}`;
  EVENEMENTS.forEach((e) => {
    d += ` H${x(e.jour)} V${y(soldeA(e.jour))}`;
  });
  return `${d} H${x(JOURS)}`;
})();

// Même courbe, relevée de 600 000 FCFA après le paiement des factures en retard
const CHEMIN_B = (() => {
  let d = `M${x(RELANCES.jour)} ${y(soldeA(RELANCES.jour))} V${y(soldeB(RELANCES.jour))}`;
  EVENEMENTS.filter((e) => e.jour > RELANCES.jour).forEach((e) => {
    d += ` H${x(e.jour)} V${y(soldeB(e.jour))}`;
  });
  return `${d} H${x(JOURS)}`;
})();

export default function HistoireTresorerie() {
  const racine = useRef(null);
  const [reduit] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [p, setP] = useState(reduit ? 1 : 0);

  useEffect(() => {
    if (reduit) return undefined;
    let image = 0;

    const calculer = () => {
      image = 0;
      const el = racine.current;
      if (!el) return;
      const haut = el.getBoundingClientRect().top;
      const total = el.offsetHeight - (window.innerHeight - ENTETE);
      setP(clamp((ENTETE - haut) / total));
    };
    const demander = () => {
      if (!image) image = requestAnimationFrame(calculer);
    };

    calculer();
    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander);
    return () => {
      cancelAnimationFrame(image);
      window.removeEventListener('scroll', demander);
      window.removeEventListener('resize', demander);
    };
  }, [reduit]);

  const jourA = clamp(p / P_FIN_A) * JOURS;
  const modeB = p > P_DEBUT_B;
  const jourB = RELANCES.jour + clamp((p - P_DEBUT_B) / (P_FIN_B - P_DEBUT_B)) * (JOURS - RELANCES.jour);
  const jour = modeB ? jourB : jourA;
  const solde = modeB ? soldeB(jourB) : soldeA(jourA);
  const etape = p < 0.16 ? 0 : p < 0.53 ? 1 : p < P_DEBUT_B ? 2 : 3;

  const alerte = jourA >= 77 && !modeB;
  const evite = modeB && jourB >= 82;

  const dernier = [...EVENEMENTS].reverse().find((e) => e.jour <= jourA);
  const tag = modeB
    ? { cle: 'relances', libelle: 'Deux factures en retard payées', delta: RELANCES.montant }
    : dernier && { cle: `e${dernier.jour}`, libelle: dernier.libelle, delta: dernier.delta };

  const classeSolde = solde < 0 ? 'negatif' : modeB ? 'positif' : '';
  const classePoint = solde < 0 ? 'neg' : modeB ? 'vert' : '';

  return (
    <section
      id="histoire"
      ref={racine}
      className={`l-histoire${reduit ? ' l-histoire-statique' : ''}`}
    >
      <div className="l-histoire-scene">
        <div className="l-conteneur l-histoire-grille">
          <h2 className="sr-only">Votre trésorerie, jour après jour</h2>

          <div className="h-textes">
            {ETAPES.map((et, i) => (
              <div key={et.titre} className={`h-etape${i === etape ? ' actif' : ''}`}>
                <span className="h-etape-num">{i + 1}</span>
                <div>
                  <h3>{et.titre}</h3>
                  <p>{et.texte}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="h-panneau">
            <div className="h-entete">
              <div>
                <span className="h-libelle">Solde prévu le {dateDuJour(jour)}</span>
                <strong className={classeSolde}>
                  {fmt.format(solde)} <small>FCFA</small>
                </strong>
              </div>
              {tag && (
                <div className="h-evenement" key={tag.cle}>
                  <span>{tag.libelle}</span>
                  <b className={tag.delta < 0 ? 'neg' : 'pos'}>
                    {tag.delta < 0 ? '−' : '+'}
                    {fmt.format(Math.abs(tag.delta))}
                  </b>
                </div>
              )}
            </div>

            <div className="h-graphique-boite">
              {alerte && (
                <span
                  className="h-chip h-chip-rouge"
                  style={{ right: `${100 - (x(77) / 620) * 100}%` }}
                >
                  Découvert prévu le 28 décembre
                </span>
              )}
              {evite && <span className="h-chip h-chip-vert">Découvert évité</span>}

              <svg
                viewBox="0 0 620 330"
                className="h-graphique"
                role="img"
                aria-label="Courbe de trésorerie prévue sur 90 jours : elle passe sous zéro le 28 décembre, puis se redresse après le paiement de deux factures en retard"
              >
                <defs>
                  <clipPath id="h-clip-a">
                    <rect x="0" y="0" width={x(jourA)} height="330" />
                  </clipPath>
                  <clipPath id="h-clip-b">
                    <rect
                      x={x(RELANCES.jour)}
                      y="0"
                      width={Math.max(0, x(jourB) - x(RELANCES.jour))}
                      height="330"
                    />
                  </clipPath>
                  <clipPath id="h-clip-bas">
                    <rect x="0" y={Y_ZERO} width="620" height="140" />
                  </clipPath>
                </defs>

                {[0, 30, 60, 90].map((j) => (
                  <line key={j} x1={x(j)} x2={x(j)} y1="16" y2="296" className="h-grille" />
                ))}

                {jourA > 77 && (
                  <rect
                    x={x(77)}
                    y={Y_ZERO}
                    width={Math.max(0, x(Math.min(jourA, JOURS)) - x(77))}
                    height={296 - Y_ZERO}
                    className="h-zone-rouge"
                  />
                )}

                <line x1={X0} x2={X1} y1={Y_ZERO} y2={Y_ZERO} className="h-zero" />
                {alerte && <line x1={x(77)} x2={x(77)} y1="40" y2={Y_ZERO} className="h-trait" />}

                <g clipPath="url(#h-clip-a)">
                  <path d={CHEMIN_A} className="h-ligne-a" />
                  <path d={CHEMIN_A} className="h-ligne-rouge" clipPath="url(#h-clip-bas)" />
                </g>

                {modeB && <path d={CHEMIN_B} clipPath="url(#h-clip-b)" className="h-ligne-b" />}

                {EVENEMENTS.map(
                  (e) =>
                    jourA >= e.jour && (
                      <circle
                        key={e.jour}
                        cx={x(e.jour)}
                        cy={y(soldeA(e.jour))}
                        r="4"
                        className="h-marque"
                      />
                    )
                )}

                <g
                  className="h-curseur"
                  style={{ transform: `translate(${x(jour)}px, ${y(solde)}px)` }}
                >
                  <circle r="13" className="h-anneau" />
                  <circle r="6.5" className={`h-point ${classePoint}`} />
                </g>

                <text x={x(0)} y="322" className="h-axe">
                  Aujourd'hui
                </text>
                {[30, 60, 90].map((j) => (
                  <text key={j} x={x(j)} y="322" textAnchor="middle" className="h-axe">
                    {j} j
                  </text>
                ))}
              </svg>
            </div>
          </div>
        </div>

        <div className="h-progression" aria-hidden="true">
          <span style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>
    </section>
  );
}